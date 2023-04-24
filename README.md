# Notification Hub

This repository contains all models that should be honored by all _Notification Hub_ components. Specifically, it defines the target platforms that can receive notifications, as well as the notification's content.

## Available Target Platforms

There are two targets were you can publish notifications to: _Azure DevOps_ and _Slack_. Check the following examples to choose the payload that is most suitable to your needs:

### Azure DevOps

Write the notification as a comment in an _Azure Devops Work Item_:

```json
{
  "type": "azure-work-item",
  "workItem": {
    "id": 1,
    "project": "project-name"
  }
}
```

### Slack

Post the notification as a message in a _Slack_ channel:

```json
{
  "type": "slack-channel",
  "channel": "tests"
}
```

Send the notification as a _Direct Message_ (_DM_) to all members in a _Slack_ channel:

```json
{
  "type": "slack-channel-members",
  "channel": "tests"
}
```

Send the notification as a _Direct Message_ (_DM_) to a single _Slack_ member:

```json
{
  "type": "slack-member-email",
  "email": "tests@7egend.cr"
}
```

Send the notification as a _Direct Message_ (_DM_) to a list of _Slack_ members:

```json
{
  "type": "slack-members-email",
  "emails": [
    "tests+1@7egend.cr",
    "tests+2@7egend.cr",
    "tests+3@7egend.cr",
    "tests+4@7egend.cr"
  ]
}
```

> NOTE: This target will send a message directly to each user. It won't create a group conversation.

## Supported Notifications

Each notification is associated with a specific event. When posting notifications, each of those notifications will be renderered differently and based on the context of the target platform. Check the [runner](https://gitlab.com/7egend/projects/home/microservices/notification-hub/server/runner) repository for more info.

### Deployments

New succesful deployment:

```json
{
  "type": "SuccessfulDeployment",
  "author": "Author Name",
  "createdAt": "YYYY-MM-DDTHH:mm:ss.xxxZ",
  "environment": ["development", "qa", "staging", "production"],
  "group": "project-group",
  "subgroup": "project-subsgroup",
  "release": {
    "tag": "<release-version>",
    "changelog": "<release-description>"
  },
  "links": {
    "sourceCode": "<repository-url>"
  }
}
```

### Docker Images

Failure building / publishing a new _Docker_ image:

```json
{
  "type": "FailedDockerImage",
  "group": "<project-group>",
  "links": {
    "sourceCode": "<repository-url>",
    "pipeline": "<pipeline-url>",
    "registry": "<container-registry-url>",
    "image": "<docker-image-url>"
  }
}
```

New _Docker_ image pushed to container registry:

```json
{
  "type": "NewDockerImage",
  "author": "Author Name",
  "group": "project-group",
  "release": {
    "tag": "<release-version>",
    "changelog": "<release-description>"
  },
  "links": {
    "sourceCode": "<repository-url>",
    "image": "<docker-image-url>"
  }
}
```

### Design Files

New _Figma_ file version:

```json
{
  "type": "NewDesignFile",
  "author": "Author Name",
  "createdAt": "YYYY-MM-DDTHH:mm:ss.xxxZ",
  "group": "project-group",
  "subgroup": "project-subsgroup",
  "release": {
    "tag": "<release-version>",
    "changelog": "<release-description>"
  },
  "differences": {
    "added": <int>,
    "removed": <int>,
    "changed": <int>
  },
  "links": {
    "figma": "<figma-file-url>",
    "azureWorkItem": "<azure-work-item-url>",
    "report": "<diff-report-url>"
  }
}
```

### NPM Packages

New _NPM_ package version:

```json
{
  "type": "NewNpmPackageVersion",
  "author": "Author Name",
  "group": "project-group",
  "release": {
    "tag": "<release-version>",
    "changelog": "<release-description>"
  },
  "links": {
    "sourceCode": "<repository-url>",
    "registry": "<registry-url>"
  }
}
```

## Publishing Changes

This package should only be published using a _CI/CD_ pipeline. Check with the _DevOps_ team if you're experience any issues.

If you still need to publish it manually, run the following 2 commands:

Build the package to lib/ folder.

```bash
yarn run build
```

Publish the built `lib` folder to the package registry:

```bash
npm publish
```

```bash
npm publish
```
