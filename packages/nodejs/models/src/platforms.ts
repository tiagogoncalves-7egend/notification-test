import * as z from 'zod'

const AzureWorkItem = z.object({
  id: z.number().min(1),
  project: z.string().min(1),
})

const AzureWorkItemPlatform = z.object({
  type: z.literal('azure-work-item'),
  workItem: AzureWorkItem,
})

const SlackChannelPlatform = z.object({
  type: z.literal('slack-channel'),
  channel: z.string().min(1),
})

const SlackChannelMembersPlatform = z.object({
  type: z.literal('slack-channel-members'),
  channel: z.string().min(1),
})

const SlackMemberEmailPlatform = z.object({
  type: z.literal('slack-member-email'),
  email: z.string().email(),
})

const SlackMembersEmailPlatform = z.object({
  type: z.literal('slack-members-email'),
  emails: z.array(z.string().email()).min(1),
})

export const Platform = z.union([
  AzureWorkItemPlatform,
  SlackChannelPlatform,
  SlackChannelMembersPlatform,
  SlackMemberEmailPlatform,
  SlackMembersEmailPlatform,
])

export type AzureWorkItem = z.TypeOf<typeof AzureWorkItem>
export type Platform = z.TypeOf<typeof Platform>
