import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { Request } from 'express'
import { flow, pipe } from 'fp-ts/lib/function'
import { parse } from './decoders'
import {
  accessDeniedResponse,
  badRequest,
  createdResponse,
  internalServerErrorResponse,
  isAuthorizedRequest,
} from './server'
import { PublishRequest } from '@7egend/notification-hub-models/lib/requests'

export type Dependencies = {
  accessTokens: string[]
  publish: (request: PublishRequest) => TE.TaskEither<unknown, unknown>
}

/** Functions */
export const requestReceived = (dependencies: Dependencies) => (req: Request) =>
  pipe(
    req,
    E.fromPredicate(
      isAuthorizedRequest(dependencies.accessTokens),
      accessDeniedResponse
    ),
    E.map(req => req.body),
    E.chainW(flow(parse(PublishRequest), E.mapLeft(invalidPublishRequest))),
    TE.fromEither,
    TE.chainW(publishRequestReceived(dependencies))
  )

export const publishRequestReceived = ({ publish }: Dependencies) =>
  flow(
    publish,
    TE.mapLeft(() =>
      internalServerErrorResponse('Could not publish notifications')
    ),
    TE.map(createdResponse)
  )

const invalidPublishRequest = () =>
  badRequest('Request body is not a valid publish request json data.')
