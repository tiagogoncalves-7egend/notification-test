import * as A from 'fp-ts/lib/Array'
import * as T from 'fp-ts/lib/Task'
import * as TE from 'fp-ts/lib/TaskEither'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import { pipe } from 'fp-ts/lib/function'

export const parallel = <E, A>(tasks: TE.TaskEither<E, A>[]) =>
    pipe(
        tasks,
        A.map(TE.mapLeft(NEA.of)),
        A.sequence(
            TE.getApplicativeTaskValidation(T.ApplyPar, NEA.getSemigroup<E>())
        )
    )
