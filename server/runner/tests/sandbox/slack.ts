import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { SlackClient } from '../../src/app'

export const successfulSlackClient = (
    post: () => Promise<unknown>
): SlackClient => ({
    lookupUserByEmail: () => TE.of({ ok: true, user: { id: 'M201' } }),
    conversationsList: () =>
        TE.of({
            ok: true,
            channels: [
                { id: 'C01', name: 'general' },
                { id: 'C02', name: 'random' },
                { id: 'C03', name: 'weirds' },
                { id: 'C04', name: 'tests' },
            ],
        }),

    conversationMembers: () =>
        TE.of({ ok: true, members: ['M201', 'M202', 'M203'] }),

    postMessage: () =>
        pipe(
            TE.tryCatch(post, E.toError),
            TE.map(() => ({ ok: true }))
        ),
})
