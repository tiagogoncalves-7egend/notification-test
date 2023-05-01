import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { NextFunction, Request, Response } from 'express'
import { send, internalServerErrorResponse, notFoundResponse } from './server'

export const notFound = (req: Request, res: Response) =>
  pipe(notFoundResponse(req), TE.left, send(res))

export const syntaxError = (
  err: unknown,
  _: unknown,
  res: Response,
  next: NextFunction
) =>
  err instanceof SyntaxError
    ? pipe(internalServerErrorResponse('Syntax error'), TE.left, send(res))
    : next(err)

export const internalServerError = (
  _err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => pipe(internalServerErrorResponse(), TE.left, send(res))
