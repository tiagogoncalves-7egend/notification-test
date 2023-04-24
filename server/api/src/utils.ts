import * as E from 'fp-ts/lib/Either'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'

export const hugTask =
    <E, A, I>(
        before: (input: I) => T.Task<unknown>,
        after: (e: E.Either<E, A>) => T.Task<unknown>
    ) =>
    (handler: (input: I) => TE.TaskEither<E, A>) =>
    (input: I) =>
        pipe(
            input,
            TE.of,
            TE.chainFirstTaskK(before),
            TE.chainW(handler),
            T.chainFirst(after)
        )
