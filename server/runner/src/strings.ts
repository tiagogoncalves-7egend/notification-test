import * as A from 'fp-ts/lib/Array'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'

export const tagOf = (imageUrl: string) =>
    pipe(
        imageUrl.match(/[^\/]+\/[^\/]+:.+$/gm),
        O.fromNullable,
        O.chain(NEA.fromArray),
        O.chain(A.head),
        O.getOrElse(() => imageUrl)
    )
