import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { transports } from 'winston'
import { flow } from 'fp-ts/lib/function'
import { parse } from './decoders'
import { createApp, Environment } from './live'

const program = flow(
  parse(Environment),
  TE.fromEither,
  TE.chain(createApp([new transports.Console()])),
  TE.orElseFirstIOK(reason =>
    T.fromIO(() => {
      console.error('An error occurred while starting the application.')
      console.error('Reason:', reason)
    })
  )
)

program(process.env)()
