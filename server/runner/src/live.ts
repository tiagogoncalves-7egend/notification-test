import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import winston from 'winston'
import z from 'zod'
import { WebClient } from '@slack/web-api'
import { listen } from './amqp'
import { AzureClient, Dependencies, SlackClient, stringReceived } from './app'
import { pipe } from 'fp-ts/lib/function'
import { dataResultLogTask, messageLogTask } from './logger'
import { connect } from 'amqp-connection-manager'
import { getPersonalAccessTokenHandler, WebApi } from 'azure-devops-node-api'
import { IWorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi'

/** Models */
export const Environment = z.object({
  AMQP_URL: z.string().url(),
  AMQP_QUEUE: z.string().min(1).default('notifications'),
  AZURE_ORG_URL: z.string().url(),
  AZURE_ACCESS_TOKEN: z.string().min(1),
  SLACK_ACCESS_TOKEN: z.string().min(1),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn']).default('debug'),
  LOG_NAME: z.string().min(1).default('notification-hub-runner'),
})

// Functions
export const createApp =
  (transports: winston.transport[]) => (environment: Environment) =>
    pipe(
      TE.Do,
      TE.bind('workItemApi', () =>
        getWorkItemTrackingApi(
          environment.AZURE_ACCESS_TOKEN,
          environment.AZURE_ORG_URL
        )
      ),
      TE.chain(({ workItemApi }) =>
        TE.tryCatch(async () => {
          // Logging.
          const logger = winston.createLogger({
            level: environment.LOG_LEVEL,
            levels: winston.config.syslog.levels,
            format: winston.format.json(),
            defaultMeta: { service: environment.LOG_LEVEL },
            transports,
          })
          // Dependencies.
          const dependencies: Dependencies = {
            azureClient: createAzureClient(workItemApi),
            slackClient: createSlackClient(environment.SLACK_ACCESS_TOKEN),
          }
          // AMQP client.
          const connection = connect(environment.AMQP_URL)
          listen(connection, environment.AMQP_QUEUE, message =>
            pipe(
              message.content.toString(),
              TE.of,
              TE.chainFirstIOK(messageLogTask(logger)),
              TE.chain(stringReceived(dependencies)),
              T.chainFirst(dataResultLogTask(logger))
            )
          )
          return connection
        }, E.toError)
      )
    )

const createAzureClient = (api: IWorkItemTrackingApi): AzureClient => ({
  postComment:
    ({ id, project }) =>
    data =>
      TE.tryCatch(() => api.addComment(data, project, id), E.toError),
})

const createSlackClient = (accessToken: string): SlackClient => {
  const api = new WebClient(accessToken)
  return {
    lookupUserByEmail: options =>
      TE.tryCatch(() => api.users.lookupByEmail(options), E.toError),

    conversationsList: options =>
      TE.tryCatch(() => api.conversations.list(options), E.toError),

    conversationMembers: options =>
      TE.tryCatch(() => api.conversations.members(options), E.toError),

    postMessage: options =>
      TE.tryCatch(() => api.chat.postMessage(options), E.toError),
  }
}

const getWorkItemTrackingApi = (accessToken: string, orgUrl: string) =>
  TE.tryCatch(() => {
    return pipe(
      accessToken,
      getPersonalAccessTokenHandler,
      authHandler => new WebApi(orgUrl, authHandler),
      webApi => webApi.getWorkItemTrackingApi()
    )
  }, E.toError)

// Types
export type Environment = z.TypeOf<typeof Environment>
