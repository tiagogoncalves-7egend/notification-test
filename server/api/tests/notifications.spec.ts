import * as E from 'fp-ts/lib/Either'
import * as TE from 'fp-ts/lib/TaskEither'
import { pipe } from 'fp-ts/lib/function'
import { Dependencies, publishRequestReceived } from '../src/notifications'
import { Platform } from '@7egend/notification-hub-models/lib/platforms'
import { Notification } from '@7egend/notification-hub-models/lib/notifications'
import { PublishRequest } from '@7egend/notification-hub-models/lib/requests'

describe('Publish request received', () => {
    it('Should return a Created OK response', async () => {
        const platforms: Platform[] = [
            { type: 'slack-channel-members', channel: 'designops' },
            {
                type: 'azure-work-item',
                workItem: { id: 1, project: 'changelog' },
            },
        ]
        const notification: Notification = {
            type: 'SuccessfulDeployment',
            author: 'John doe',
            createdAt: new Date('2023-01-06T16:56:19+0000'),
            environment: 'development',
            group: 'DesignOps',
            subgroup: 'devops/ansible',
            release: { tag: 'latest', changelog: 'Fixed a fatal crash' },
            links: { sourceCode: 'https://7egend.cr' },
        }
        const publichRequest: PublishRequest = {
            platforms,
            notification,
        }
        const publish = () => TE.of('success')
        const dependencies: Dependencies = {
            accessTokens: [''],
            publish,
        }
        const response = await pipe(
            publichRequest,
            publishRequestReceived(dependencies)
        )()
        expect(response).toStrictEqual(
            E.right({ data: 'success', statusCode: 201 })
        )
    })
    it('Should return an internal server error when failed to publish', async () => {
        const platforms: Platform[] = [
            { type: 'slack-channel-members', channel: 'designops' },
        ]
        const notification: Notification = {
            type: 'SuccessfulDeployment',
            author: 'John doe',
            createdAt: new Date('2023-01-06T16:56:19+0000'),
            environment: 'development',
            group: 'DesignOps',
            subgroup: 'devops/ansible',
            release: { tag: 'latest', changelog: 'Fixed a fatal crash' },
            links: { sourceCode: 'https://7egend.cr' },
        }
        const publichRequest: PublishRequest = {
            platforms,
            notification,
        }
        const publish = () => TE.left(new Error('Always fail'))
        const dependencies: Dependencies = {
            accessTokens: [''],
            publish,
        }
        const response = await pipe(
            publichRequest,
            publishRequestReceived(dependencies)
        )()
        expect(response).toStrictEqual(
            E.left({
                error: 'Could not publish notifications',
                statusCode: 500,
            })
        )
    })
})
