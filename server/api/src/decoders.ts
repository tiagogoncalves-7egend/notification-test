import * as E from 'fp-ts/lib/Either'
import z from 'zod'
import { pipe } from 'fp-ts/lib/function'

export const parse =
    <O, I, D extends z.ZodTypeDef = z.ZodTypeDef>(
        schema: z.ZodSchema<O, D, I>
    ) =>
    (data: unknown): E.Either<z.ZodError, O> =>
        pipe(data, schema.safeParse, result =>
            result.success ? E.right(result.data) : E.left(result.error)
        )
