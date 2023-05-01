import * as TE from 'fp-ts/lib/TaskEither'
import { Express } from 'express'
import { pipe } from 'fp-ts/lib/function'
import { Dependencies, requestReceived } from './notifications'
import { okResponse, send } from './server'

export const probes = (app: Express) =>
  app.get('/status', (_, res) => pipe(true, okResponse, TE.of, send(res)))

export const notifications = (dependencies: Dependencies) => (app: Express) =>
  app.post('/v1/notifications', (req, res) =>
    pipe(req, requestReceived(dependencies), send(res))
  )
