import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { Comment } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces'
import { AzureClient } from '../../src/app'

export const successfulAzureClient = (
    post: () => Promise<unknown>
): AzureClient => ({
    postComment: () => () =>
        pipe(
            TE.tryCatch(post, E.toError),
            TE.map((): Comment => ({ id: 1 }))
        ),
})
