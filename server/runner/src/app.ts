import * as A from 'fp-ts/lib/Array'
import * as E from 'fp-ts/lib/Either'
import * as J from 'fp-ts/lib/Json'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import { flow, pipe } from 'fp-ts/lib/function'
import { string } from 'fp-ts'
import { parse } from './decoders'
import {
  ChatPostMessageArguments,
  ChatPostMessageResponse,
  ConversationsListArguments,
  ConversationsListResponse,
  ConversationsMembersArguments,
  ConversationsMembersResponse,
  UsersLookupByEmailArguments,
  UsersLookupByEmailResponse,
} from '@slack/web-api'
import { parallel } from './utils'
import { compose as AzureCompose } from './devops'
import { compose as SlackCompose, Message } from './slack'
import { CommentCreate } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces'
import { Comment } from 'azure-devops-node-api/interfaces/GitInterfaces'
import { PublishRequest } from '@7egend/notification-hub-models/lib/requests'
import { Notification } from '@7egend/notification-hub-models/lib/notifications'
import {
  AzureWorkItem,
  Platform,
} from '@7egend/notification-hub-models/lib/platforms'

/** Errors */
type InputError = {
  readonly type: 'Input'
  readonly text: string
  readonly reason: unknown
}

type ConversationNotFoundError = {
  name: 'ConversationNotFoundError'
  message: string
  conversation: string
}

type EmptyConversationIdError = {
  name: 'EmptyConversationIdError'
  message: string
  conversation: string
}

type UserEmailNotFoundError = {
  name: 'UserEmailNotFoundError'
  message: string
  email: string
}

const inputError =
  (text: string) =>
  (reason: unknown): InputError => ({ type: 'Input', text, reason })

const conversationNotFoundError =
  (conversation: string) => (): ConversationNotFoundError => ({
    name: 'ConversationNotFoundError',
    message: `Could not find conversation '${conversation}' in the returned conversations list`,
    conversation,
  })

const emptyConversationIdError =
  (conversation: string) => (): EmptyConversationIdError => ({
    name: 'EmptyConversationIdError',
    message: `The conversation '${conversation}' was found, but it has an empty id`,
    conversation,
  })

const userEmailNotFoundError =
  (email: string) => (): UserEmailNotFoundError => ({
    name: 'UserEmailNotFoundError',
    message: `Could not find user with email '${email}'`,
    email,
  })

export type AzureClient = {
  postComment: (
    workItem: AzureWorkItem
  ) => (data: CommentCreate) => TE.TaskEither<Error, Comment>
}

export type SlackClient = {
  lookupUserByEmail: (
    options: UsersLookupByEmailArguments
  ) => TE.TaskEither<Error, UsersLookupByEmailResponse>
  conversationsList: (
    options: ConversationsListArguments
  ) => TE.TaskEither<Error, ConversationsListResponse>
  conversationMembers: (
    options: ConversationsMembersArguments
  ) => TE.TaskEither<Error, ConversationsMembersResponse>
  postMessage: (
    options: ChatPostMessageArguments
  ) => TE.TaskEither<Error, ChatPostMessageResponse>
}

export type Dependencies = {
  azureClient: AzureClient
  slackClient: SlackClient
}

/** Functions */
export const stringReceived = (dependencies: Dependencies) =>
  flow(
    String,
    J.parse,
    E.mapLeft(inputError('Input string is not a valid json object')),
    TE.fromEither,
    TE.chainW(dataReceived(dependencies))
  )

export const dataReceived = (dependencies: Dependencies) =>
  flow(
    parse(PublishRequest),
    E.mapLeft(inputError('Input string is not a valid publish request object')),
    TE.fromEither,
    TE.chainW(publishRequestReceived(dependencies))
  )

export const publishRequestReceived =
  (dependencies: Dependencies) =>
  ({ platforms, notification }: PublishRequest) =>
    pipe(
      platforms,
      A.map(toTask(dependencies, notification)),
      A.compact,
      parallel
    )

const toTask =
  ({ azureClient, slackClient }: Dependencies, notification: Notification) =>
  (platform: Platform) => {
    if (platform.type === 'slack-channel-members') {
      return pipe(
        notification,
        postSlackMember(slackClient)(platform.channel),
        O.of
      )
    }
    if (platform.type === 'slack-channel') {
      return pipe(
        notification,
        postSlackChannel(slackClient)(platform.channel),
        O.of
      )
    }
    if (platform.type === 'slack-member-email') {
      return pipe(
        notification,
        postSlackMemberEmail(slackClient)(platform.email),
        O.of
      )
    }
    if (platform.type === 'slack-members-email') {
      return pipe(
        notification,
        postSlackMembersEmail(slackClient)(platform.emails),
        O.of
      )
    }
    if (
      notification.type === 'SuccessfulDeployment' ||
      notification.type === 'NewDesignFile'
    ) {
      return pipe(
        notification,
        postAzureWorkItem(azureClient)(platform.workItem),
        O.of
      )
    }
    return O.none
  }

const postAzureWorkItem =
  (azureClient: AzureClient) => (workItem: AzureWorkItem) =>
    flow(AzureCompose, azureClient.postComment(workItem), TE.map(String))

const postSlackChannel =
  (slackClient: SlackClient) =>
  (channel: string) =>
  (notification: Notification) => {
    const message = SlackCompose(notification)
    const post = flow(postOptions(message), slackClient.postMessage)
    return pipe(
      channel,
      findChannelIdByName(slackClient),
      TE.chain(post),
      TE.map(String)
    )
  }

const postSlackMember =
  (slackClient: SlackClient) =>
  (channel: string) =>
  (notification: Notification) => {
    const message = SlackCompose(notification)
    const postAll = A.map(flow(postOptions(message), slackClient.postMessage))
    return pipe(
      channel,
      findConversationMembersIds(slackClient),
      TE.chainW(flow(postAll, parallel)),
      TE.map(String)
    )
  }

const postSlackMemberEmail =
  (slackClient: SlackClient) =>
  (email: string) =>
  (notification: Notification) => {
    const message = SlackCompose(notification)
    return pipe(
      email,
      findUserIdByEmail(slackClient),
      TE.chainW(flow(postOptions(message), slackClient.postMessage)),
      TE.map(String)
    )
  }

const postSlackMembersEmail =
  (slackClient: SlackClient) =>
  (emails: Array<string>) =>
  (notification: Notification) =>
    pipe(
      emails,
      A.uniq(string.Eq),
      A.map(email => postSlackMemberEmail(slackClient)(email)(notification)),
      parallel,
      TE.map(responses => responses.join(','))
    )

const postOptions =
  (message: Message) =>
  (conversationId: string): ChatPostMessageArguments => ({
    channel: conversationId,
    text: message.text,
    attachments: O.toUndefined(message.attachments),
  })

const findConversationMembersIds = (slackClient: SlackClient) =>
  flow(
    findChannelIdByName(slackClient),
    TE.map(conversationId => ({ channel: conversationId })),
    TE.chainW(slackClient.conversationMembers),
    TE.map(response => response.members ?? [])
  )

const findChannelIdByName = (slackClient: SlackClient) => (name: string) =>
  pipe(
    publichUnarchivedChannelOptions,
    slackClient.conversationsList,
    TE.map(response => response.channels ?? []),
    TE.chainW(
      flow(
        A.findFirst(conversation => conversation.name === name),
        TE.fromOption(conversationNotFoundError(name))
      )
    ),
    TE.chainW(({ id }) =>
      pipe(id, O.fromNullable, TE.fromOption(emptyConversationIdError(name)))
    )
  )

const findUserIdByEmail = (slackClient: SlackClient) => (email: string) =>
  pipe(
    { email },
    slackClient.lookupUserByEmail,
    TE.map(({ user }) => user?.id),
    TE.map(O.fromNullable),
    TE.chainW(TE.fromOption(userEmailNotFoundError(email)))
  )

const publichUnarchivedChannelOptions = {
  types: 'public_channel',
  exclude_archived: true,
  limit: 1000,
}
