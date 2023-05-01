import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/function'
import themes from './themes'
import { formatToTimeZone } from 'date-fns-timezone'
import { CommentCreate } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces'
import {
  NewDesignFile,
  Release,
  SuccessfulDeployment,
} from '@7egend/notification-hub-models/lib/notifications'

export const compose = (notification: SuccessfulDeployment | NewDesignFile) =>
  notification.type === 'SuccessfulDeployment'
    ? composeSuccessfulDeployment(notification)
    : composeNewDesignFile(notification)

const composeSuccessfulDeployment = ({
  createdAt,
  environment,
  author,
  release,
}: SuccessfulDeployment): CommentCreate => ({
  text: `
            <h1><b>🚀 ${themes[environment].emoji} Deployed a new version: ${
    release.tag
  }</b></h1>
            <div><b>Author:</b></div>
            <div>${author}<br><br></div>
            <div><b>Environment:</b></div>
            <div>${environment}<br><br></div>
            <div>
                <div><b>Released At:</b></div>
                <div>${stringFromDate(createdAt)}<br><br></div>
            </div>
            <div><b>Changelog:</b></div>
            <div>${changelog(release)}<br><br><br></div>
            `,
})

const composeNewDesignFile = ({
  createdAt,
  author,
  release,
  differences,
}: NewDesignFile): CommentCreate => ({
  text: `
    <h1><b>🎨 🚀 Released a new design version: ${release.tag}</b></h1>
    <div><b>Author:</b></div>
    <div>${author}<br><br></div>
    <div>
        <div><b>Released At:</b></div>
        <div>${stringFromDate(createdAt)}<br><br></div>
    </div>
    <div><b>Changelog:</b></div>
    <div>${changelog(release)}<br><br><br></div>
    <div>
        🗑️ Frames Removed: ${differences.added}<br>
        ✏️ Frames Changed: ${differences.changed}<br>
        ➕ Frames Added: ${differences.removed}<br>
    </div>
    `,
})

const changelog = ({ changelog }: Release) =>
  pipe(
    changelog,
    O.fromNullable,
    O.map(changelog => `<i>"${changelog}"</i>`),
    O.getOrElse(() => 'No description provided.')
  )

const stringFromDate = (date: Date, timeZone: string = 'Europe/Lisbon') =>
  formatToTimeZone(date, `D MMMM YYYY, H:mm ([${timeZone}])`, { timeZone })
