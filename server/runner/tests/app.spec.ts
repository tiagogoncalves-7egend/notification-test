import * as E from 'fp-ts/lib/Either'
import { Notification } from '@7egend/notification-hub-models/lib/notifications'
import { Platform } from '@7egend/notification-hub-models/lib/platforms'
import { PublishRequest } from '@7egend/notification-hub-models/lib/requests'
import { dataReceived, Dependencies } from '../src/app'
import { successfulAzureClient } from './sandbox/azure'
import { successfulSlackClient } from './sandbox/slack'

describe('Invalid data', () => {
    const invalidPublishRequestError = {
        type: 'Input',
        text: 'Input string is not a valid publish request object',
    }
    it('Should return a decode error when data is not a valid JSON string', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)('not-a-json')()
        expect(result).toMatchObject(E.left(invalidPublishRequestError))
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(0)
    })
    it('Should return a decode error when data is an empty string', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)('not-a-json')()
        expect(result).toMatchObject(E.left(invalidPublishRequestError))
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(0)
    })
    it('Should return a decode error when data is null or undefined', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result1 = await dataReceived(dependencies)(null)()
        const result2 = await dataReceived(dependencies)(undefined)()
        expect(result1).toMatchObject(E.left(invalidPublishRequestError))
        expect(result2).toMatchObject(E.left(invalidPublishRequestError))
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(0)
    })
})

describe('Publish Requests', () => {
    it('Should accept a valid successful deployment request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)({
            platforms: [{ type: 'slack-channel-members', channel: 'tests' }],
            notification: {
                type: 'SuccessfulDeployment',
                group: 'typescript',
                subgroup: 'npm/tests',
                author: 'Charles Darwing',
                createdAt: '2020-02-23T20:27:16Z',
                environment: 'production',
                release: { tag: '1.0.0', changelog: 'Just another test' },
                links: { sourceCode: 'http://localhost/source' },
            },
        })()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(3)
    })
    it('Should accept a valid failed docker image request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)({
            platforms: [{ type: 'slack-channel-members', channel: 'tests' }],
            notification: {
                type: 'FailedDockerImage',
                group: 'typescript',
                links: {
                    sourceCode: 'http://localhost/source',
                    pipeline: 'http://localhost/pipeline',
                    registry: 'http://localhost/registry',
                    image: 'http://localhost/image',
                },
            },
        })()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(3)
    })
    it('Should accept a valid new docker image request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)({
            platforms: [{ type: 'slack-channel-members', channel: 'tests' }],
            notification: {
                type: 'NewDockerImage',
                author: 'Charles Darwin',
                group: 'typescript',
                release: { tag: '1.0.0', changelog: 'Just another test' },
                links: {
                    sourceCode: 'http://localhost/source',
                    image: 'http://localhost/image',
                },
            },
        })()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(3)
    })
    it('Should accept a valid new design file request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)({
            platforms: [{ type: 'slack-channel-members', channel: 'tests' }],
            notification: {
                type: 'NewDesignFile',
                author: 'Charles Darwin',
                createdAt: '2020-02-23T20:27:16Z',
                group: 'typescript',
                subgroup: 'npm/tests',
                release: { tag: '1.0.0', changelog: 'Just another test' },
                differences: {
                    added: 3,
                    removed: 1,
                    changed: 4,
                },
                links: {
                    figma: 'http://localhost/figma',
                    azureWorkItem: 'http://localhost/azure',
                    report: 'http://localhost/report',
                },
            },
        })()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(3)
    })
    it('Should accept a valid new package version request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const result = await dataReceived(dependencies)({
            platforms: [{ type: 'slack-channel-members', channel: 'tests' }],
            notification: {
                type: 'NewNpmPackageVersion',
                author: 'Charles Darwin',
                group: 'typescript',
                release: { tag: '1.0.0', changelog: 'Just another test' },
                links: {
                    sourceCode: 'http://localhost/source',
                    registry: 'http://localhost/registry',
                },
            },
        })()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(3)
    })
})

describe('Platforms', () => {
    const workItemPlatform: Platform = {
        type: 'azure-work-item',
        workItem: { id: 1, project: 'test' },
    }
    const slackChannelPlatform: Platform = {
        type: 'slack-channel',
        channel: 'tests',
    }
    const slackChannelMembersPlatform: Platform = {
        type: 'slack-channel-members',
        channel: 'tests',
    }
    const slackMemberEmailPlatform: Platform = {
        type: 'slack-member-email',
        email: 'tests@7egend.cr',
    }
    const slackMembersEmailPlatform: Platform = {
        type: 'slack-members-email',
        emails: ['tests+1@7egend.cr', 'tests+2@7egend.cr'],
    }
    const platforms: Platform[] = [
        workItemPlatform,
        slackChannelPlatform,
        slackChannelMembersPlatform,
        slackMemberEmailPlatform,
        slackMembersEmailPlatform,
    ]
    it('Should accept a valid successful deployment request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const notification: Notification = {
            type: 'SuccessfulDeployment',
            group: 'typescript',
            subgroup: 'npm/tests',
            author: 'Charles Darwing',
            createdAt: new Date('2020-02-23T20:27:16Z'),
            environment: 'production',
            release: { tag: '1.0.0', changelog: 'Just another test' },
            links: { sourceCode: 'http://localhost/source' },
        }
        const publishRequest: PublishRequest = {
            platforms,
            notification,
        }
        const result = await dataReceived(dependencies)(publishRequest)()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(1)
        expect(postMessage).toBeCalledTimes(7)
    })
    it('Should accept a valid failed docker image request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const notification: Notification = {
            type: 'FailedDockerImage',
            group: 'typescript',
            links: {
                sourceCode: 'http://localhost/source',
                pipeline: 'http://localhost/pipeline',
                registry: 'http://localhost/registry',
                image: 'http://localhost/image',
            },
        }
        const publishRequest: PublishRequest = {
            platforms,
            notification,
        }
        const result = await dataReceived(dependencies)(publishRequest)()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(7)
    })
    it('Should accept a valid new docker image request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const notification: Notification = {
            type: 'NewDockerImage',
            author: 'Charles Darwin',
            group: 'typescript',
            release: { tag: '1.0.0', changelog: 'Just another test' },
            links: {
                sourceCode: 'http://localhost/source',
                image: 'http://localhost/image',
            },
        }
        const publishRequest: PublishRequest = {
            platforms,
            notification,
        }
        const result = await dataReceived(dependencies)(publishRequest)()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(0)
        expect(postMessage).toBeCalledTimes(7)
    })
    it('Should accept a valid new design file request', async () => {
        const postComment = jest.fn(() => Promise.resolve())
        const postMessage = jest.fn(() => Promise.resolve())
        const dependencies: Dependencies = {
            slackClient: successfulSlackClient(postMessage),
            azureClient: successfulAzureClient(postComment),
        }
        const notification: Notification = {
            type: 'NewDesignFile',
            author: 'Charles Darwin',
            createdAt: new Date('2020-02-23T20:27:16Z'),
            group: 'typescript',
            subgroup: 'npm/tests',
            release: { tag: '1.0.0', changelog: 'Just another test' },
            differences: {
                added: 3,
                removed: 1,
                changed: 4,
            },
            links: {
                figma: 'http://localhost/figma',
                azureWorkItem: 'http://localhost/azure',
                report: 'http://localhost/report',
            },
        }
        const publishRequest: PublishRequest = {
            platforms,
            notification,
        }
        const result = await dataReceived(dependencies)(publishRequest)()
        expect(E.isRight(result)).toBe(true)
        expect(postComment).toBeCalledTimes(1)
        expect(postMessage).toBeCalledTimes(7)
    })
})
