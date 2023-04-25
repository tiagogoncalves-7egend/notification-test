import * as A from 'fp-ts/lib/Array'
import * as O from 'fp-ts/lib/Option'
import * as NEA from 'fp-ts/lib/NonEmptyArray'
import {
    ActionsBlock,
    Button,
    KnownBlock,
    MessageAttachment,
    MrkdwnElement,
    SectionBlock,
} from '@slack/web-api'
import { pipe } from 'fp-ts/lib/function'
import {
    FailedDockerImage,
    NewDesignFile,
    NewDockerImage,
    NewNpmPackageVersion,
    Notification,
    SuccessfulDeployment,
} from '@7egend/notification-hub-models/lib/notifications'

/** Functions */
export const compose = (notification: Notification) =>
    notification.type === 'SuccessfulDeployment'
        ? composeSuccessfulDeployment(notification)
        : notification.type === 'FailedDockerImage'
        ? composeFailedDockerImage(notification)
        : notification.type === 'NewDockerImage'
        ? composeNewDockerImage(notification)
        : notification.type === 'NewNpmPackageVersion'
        ? composeNewNpmPackageVersion(notification)
        : composeNewDesignFile(notification)

const composeSuccessfulDeployment = ({
    author,
    environment,
    group,
    subgroup,
    release,
    links: { sourceCode },
}: SuccessfulDeployment): Message => ({
    text: `🚀 ${themes[environment].emoji} ${group} successfully deployed a new version (\`${subgroup}:${release.tag}\`)`,
    attachments: O.some([
        attachment(themes[environment].color, [
            sectionBlock([
                markdown(
                    `\`\`\`AUTHOR: ${author}\nENVIRONMENT: ${environment}\n--------------------\nCHANGELOG:\n${release.changelog}\`\`\``
                ),
            ]),
            actionsBlock([button('View Source', sourceCode)]),
        ]),
    ]),
})

const composeNewDockerImage = ({
    author,
    group,
    release,
    links: { image, sourceCode },
}: NewDockerImage): Message => ({
    text: `🐳 😎 ${group} has a new Docker image (\`${tagOf(image)}\`)`,
    attachments: O.some([
        attachment('#0db7ed', [
            sectionBlock([
                markdown(
                    `\`\`\`AUTHOR: ${author}\nPROJECT URL: ${sourceCode}\n--------------------\nIMAGE URL:\n${image}\n--------------------\nCHANGELOG:\n${release.changelog}\`\`\``
                ),
            ]),
        ]),
    ]),
})

const composeFailedDockerImage = ({
    group,
    links: { image, pipeline, registry, sourceCode },
}: FailedDockerImage): Message => ({
    text: `🐳 😡 ${group} did not build your Docker image (\`${tagOf(
        image
    )}\`)`,
    attachments: O.some([
        attachment('#ff0000', [
            sectionBlock([
                markdown(
                    `Something went wrong while building / pushing Docker image to:\n\`\`\`${image}\`\`\``
                ),
            ]),
            actionsBlock([
                button('Visit Pipeline', pipeline),
                button('Visit Registry', registry),
                button('View Source', sourceCode),
            ]),
        ]),
    ]),
})

const composeNewDesignFile = ({
    author,
    group,
    subgroup,
    release,
    links,
    differences,
}: NewDesignFile): Message => ({
    text: `🎨 😎 ${group} has released a new design (\`${subgroup}:${release.tag}\`)`,
    attachments: O.some([
        attachment('#fcba03', [
            sectionBlock([
                markdown(
                    `\`\`\`AUTHOR: ${author}\nPROJECT_URL: ${links.figma}\n--------------------\nCHANGELOG:\n${release.changelog}\n\nFRAMES DIFF:\nAdded: ${differences.added}\nRemoved: ${differences.removed}\nChanged: ${differences.changed}\`\`\``
                ),
            ]),
            actionsBlock([
                button('View File', links.figma),
                button('Go to Work Item', links.azureWorkItem),
                button('Show Diff', links.report),
            ]),
        ]),
    ]),
})

const composeNewNpmPackageVersion = ({
    author,
    group,
    release,
    links: { registry, sourceCode },
}: NewNpmPackageVersion): Message => ({
    text: `📦 😎 ${group} has a new package version (\`${release.tag}\`)`,
    attachments: O.some([
        attachment('#d51961', [
            sectionBlock([
                markdown(
                    `\`\`\`AUTHOR: ${author}\nPROJECT URL: ${sourceCode}\n--------------------\nPACKAGE URL:\n${registry}\n--------------------\nCHANGELOG:\n${release.changelog}\`\`\``
                ),
            ]),
        ]),
    ]),
})

const attachment = (
    color: string,
    blocks: Array<KnownBlock>
): MessageAttachment => ({
    color,
    blocks,
})

const sectionBlock = (fields: Array<MrkdwnElement>): SectionBlock => ({
    type: 'section',
    fields,
})

const actionsBlock = (elements: Array<Button>): ActionsBlock => ({
    type: 'actions',
    elements,
})

const markdown = (text: string): MrkdwnElement => ({
    type: 'mrkdwn',
    text,
})

const button = (text: string, url: string): Button => ({
    type: 'button',
    text: { type: 'plain_text', text },
    url,
})

const tagOf = (imageUrl: string) =>
    pipe(
        imageUrl.match(/[^\/]+\/[^\/]+:.+$/gm),
        O.fromNullable,
        O.chain(NEA.fromArray),
        O.chain(A.head),
        O.getOrElse(() => imageUrl)
    )

/** Types */
type Theme = {
    emoji: string
    color: string
}

type Themes = {
    development: Theme
    qa: Theme
    staging: Theme
    production: Theme
}

const themes: Themes = {
    development: { emoji: '🧸', color: '#4cbb17' },
    qa: { emoji: '💉', color: '#0892d0' },
    staging: { emoji: '🥁', color: '#bc8f8f' },
    production: { emoji: '🎯', color: '#ff00ff' },
}

export type Message = {
    text: string
    attachments: O.Option<NEA.NonEmptyArray<MessageAttachment>>
}
