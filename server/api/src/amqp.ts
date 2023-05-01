import { Channel, connect } from 'amqp-connection-manager'

const channel = (url: string, queue: string) => {
  const connection = connect(url)
  const channel = connection.createChannel({
    json: true,
    setup: (channel: Channel) => channel.assertQueue(queue),
  })
  return channel
}

export default channel
