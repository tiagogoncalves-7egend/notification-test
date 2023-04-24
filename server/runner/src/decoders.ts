import * as z from 'zod'
import * as E from 'fp-ts/lib/Either'
import { pipe } from 'fp-ts/lib/function'

export const parse =
    <O, I, D extends z.ZodTypeDef = z.ZodTypeDef>(
        schema: z.ZodSchema<O, D, I>
    ) =>
    (data: unknown): E.Either<z.ZodError, O> =>
        pipe(data, schema.safeParse, result =>
            result.success === false
                ? E.left(result.error)
                : E.right(result.data)
        )
