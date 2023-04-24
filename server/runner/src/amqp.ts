import * as T from 'fp-ts/lib/Task'
import { ConsumeMessage } from 'amqplib'
import { Channel } from 'amqp-connection-manager'
import { IAmqpConnectionManager } from 'amqp-connection-manager/dist/esm/AmqpConnectionManager'

type MessageReceived = (message: ConsumeMessage) => T.Task<unknown>

export const listen = (
    connection: IAmqpConnectionManager,
    queue: string,
    messageReceived: MessageReceived
) => {
    const channel = connection.createChannel({
        json: true,
        setup: (channel: Channel) => channel.assertQueue(queue),
    })
    return channel.consume(queue, message => {
        channel.ack(message)
        messageReceived(message)()
    })
}
