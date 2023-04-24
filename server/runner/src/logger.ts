import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import winston from 'winston'

export const messageLogTask = (logger: winston.Logger) => (content: string) =>
    T.fromIO(() => logger.info('Message received:', { content }))

const failedMessageLogTask = (logger: winston.Logger) => (reason: unknown) =>
    T.fromIO(() =>
        logger.info('An error occurred while processing the message:', {
            reason,
        })
    )

const successfulMessageLogTask =
    (logger: winston.Logger) => (values: string[]) =>
        T.fromIO(() =>
            logger.info('Message successfully processed:', { values })
        )

export const dataResultLogTask = (logger: winston.Logger) =>
    E.fold(failedMessageLogTask(logger), successfulMessageLogTask(logger))
