import * as A from 'fp-ts/lib/ReadonlyArray'
import * as E from 'fp-ts/lib/Either'
import * as I from 'fp-ts/lib/Identity'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import express from 'express'
import morgan, { StreamOptions } from 'morgan'
import winston from 'winston'
import z from 'zod'
import { probes, notifications } from './routes'
import { notFound, syntaxError, internalServerError } from './middlewares'
import { Dependencies } from './notifications'
import {
    enqueueResultLogTask,
    Logger,
    serverResultLogTask,
    willEnqueueLogTask,
} from './logger'
import { pipe } from 'fp-ts/lib/function'
import { Channel, ChannelWrapper, connect } from 'amqp-connection-manager'
import { hugTask } from './utils'

export const Environment = z.object({
    // Access Tokens:
    ACCESS_TOKENS: z
        .string()
        .min(1)
        .transform(string => string.split(',')),
    // RabbitMQ server:
    AMQP_URL: z.string().url(),
    AMQP_NOTIFICATIONS_QUEUE: z.string().min(1).default('notifications'),
    // Logging:
    LOG_LEVEL: z.enum(['debug', 'info', 'warn']).default('debug'),
    LOG_NAME: z.string().min(1).default('notification-hub-api'),
    // Server:
    SERVER_HOST: z.string().min(1).default('0.0.0.0'),
    SERVER_PORT: z.coerce.number().min(1).default(3000),
    SERVER_SIZE_LIMIT: z.string().min(1).default('1mb'),
})

export type Environment = z.TypeOf<typeof Environment>

export const createApp =
    (transports: winston.transport[]) => (environment: Environment) => {
        const logger = pipe(
            {
                level: environment.LOG_LEVEL,
                levels: winston.config.syslog.levels,
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                defaultMeta: { service: environment.LOG_NAME },
                transports,
            },
            winston.createLogger,
            fromWinston
        )
        const connection = connect(environment.AMQP_URL)
        const channel = connection.createChannel({
            json: true,
            setup: (channel: Channel) => {
                channel.assertQueue(environment.AMQP_NOTIFICATIONS_QUEUE)
            },
        })
        const publish = pipe(
            environment.AMQP_NOTIFICATIONS_QUEUE,
            enqueue(channel),
            hugTask(willEnqueueLogTask(logger), enqueueResultLogTask(logger))
        )
        const dependencies: Dependencies = {
            accessTokens: environment.ACCESS_TOKENS,
            publish,
        }
        const server = createServer(logger, dependencies)(
            environment.SERVER_PORT,
            environment.SERVER_HOST,
            environment.SERVER_SIZE_LIMIT,
            { write: message => logger.info(message)()() }
        )
        return server
    }

const createServer =
    (logger: Logger, dependencies: Dependencies) =>
    (port: number, host: string, sizeLimit: string, stream: StreamOptions) =>
        pipe(
            TE.tryCatch(async () => {
                const app = express()
                    .use(express.json({ limit: sizeLimit }))
                    .use(morgan('combined', { stream }))
                pipe([probes, notifications(dependencies)], A.map(I.ap(app)))
                return app
                    .use(notFound)
                    .use(syntaxError)
                    .use(internalServerError)
                    .listen(port, host)
            }, E.toError),
            T.chainFirstIOK(serverResultLogTask(logger)(host, port))
        )

const fromWinston = ({ info, error }: winston.Logger): Logger => ({
    info: title => context => T.fromIO(() => info(title, { context })),
    error: title => context => T.fromIO(() => error(title, { context })),
})

const enqueue =
    (channel: ChannelWrapper) =>
    (queue: string) =>
    <A>(content: A) =>
        pipe(
            TE.tryCatch(() => channel.sendToQueue(queue, content), E.toError),
            TE.chain(ok => (ok ? TE.right(content) : TE.left(new Error('a'))))
        )
