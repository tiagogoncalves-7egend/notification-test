import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import { PublishRequest } from '@7egend/notification-hub-models/lib/requests'

type ActionLog = <I>(title: string) => (context?: I) => T.Task<unknown>

export type Logger = {
  info: ActionLog
  error: ActionLog
}

export const serverResultLogTask =
  ({ info, error }: Logger) =>
  (host: string, port: number) =>
    E.fold(
      reason => error('Failed to enqueue message')({ reason }),
      () => info(`Server started`)({ host, port })
    )

export const willEnqueueLogTask = ({ info }: Logger) =>
  info<PublishRequest>('Will enqueue notification')

export const enqueueResultLogTask = <E, I>({ info, error }: Logger) =>
  E.fold<E, I, T.Task<unknown>>(
    () => error('Failed to enqueue message')(),
    () => info('Message successfully enqueued')()
  )
