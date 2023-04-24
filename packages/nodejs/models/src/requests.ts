import * as z from 'zod'
import { Notification } from './notifications'
import { Platform } from './platforms'

export const PublishRequest = z.object({
  platforms: z.array(Platform).min(1),
  notification: Notification,
})

export type PublishRequest = z.TypeOf<typeof PublishRequest>
