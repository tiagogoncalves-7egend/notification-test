import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as TE from 'fp-ts/lib/TaskEither'
import { Response, Request } from 'express'
import { flow, pipe } from 'fp-ts/lib/function'
import { StatusCodes } from 'http-status-codes'
import { string } from 'fp-ts'

export type Action = TE.TaskEither<FailureResponse, SuccessResponse>

export type SuccessResponse = {
    statusCode: number
    data: unknown
}

export type FailureResponse = {
    statusCode: number
    error?: string
}

type Result = {
    statusCode: number
    body: unknown
}

export const send = (res: Response) => async (taskEither: Action) => {
    const task = pipe(
        taskEither,
        TE.match(
            ({ statusCode, error }): Result => ({
                statusCode,
                body: { error: error },
            }),
            ({ statusCode, data }): Result => ({
                statusCode,
                body: { data: data },
            })
        )
    )
    const { statusCode, body } = await task()
    res.status(statusCode).send(body)
}

export const notFoundResponse = (req: Request): FailureResponse => ({
    statusCode: StatusCodes.NOT_FOUND,
    error: `Path not found: [${req.method}] /${req.path}`,
})

export const accessDeniedResponse = (_: Request): FailureResponse => ({
    statusCode: StatusCodes.FORBIDDEN,
    error: 'Access denied',
})

export const internalServerErrorResponse = (
    error: string = 'Internal Server Error'
): FailureResponse => ({ statusCode: StatusCodes.INTERNAL_SERVER_ERROR, error })

export const okResponse = (data: unknown): SuccessResponse => ({
    statusCode: StatusCodes.OK,
    data,
})

export const createdResponse = (data: unknown): SuccessResponse => ({
    statusCode: StatusCodes.CREATED,
    data,
})

export const badRequest = (reason: unknown): FailureResponse => ({
    statusCode: StatusCodes.BAD_REQUEST,
    error: String(reason),
})

export const bearerTokenOf = ({ headers: { authorization } }: Request) =>
    pipe(
        authorization,
        O.fromNullable,
        O.map(value => value.match(/^Bearer (?<token>\w+)$/im)),
        O.map(matched => matched?.groups?.['token']),
        O.chain(O.fromNullable)
    )

export const isAuthorizedRequest = (accessTokens: string[]) =>
    flow(
        bearerTokenOf,
        O.map(value => pipe(accessTokens, A.elem(string.Eq)(value))),
        O.getOrElse(() => false)
    )
