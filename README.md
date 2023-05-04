[![Build devops/ansible docker image](https://github.com/7egend/notification-hub/actions/workflows/build-image-devops-ansible.yml/badge.svg)](https://github.com/7egend/notification-hub/actions/workflows/build-image-devops-ansible.yml) <br/>
[![Build and deploy server/runner docker image](https://github.com/7egend/notification-hub/actions/workflows/main-server-runner.yml/badge.svg)](https://github.com/7egend/notification-hub/actions/workflows/main-server-runner.yml) <br/>
[![Build and deploy server/api docker image](https://github.com/7egend/notification-hub/actions/workflows/main-server-api.yml/badge.svg)](https://github.com/7egend/notification-hub/actions/workflows/main-server-api.yml)

# Notification Hub

Use the notification hub to send notifications after a known event has happened. These notifications can be published in one or more target platforms.

This repository also contains the _TypeScript_ types that should be honored by all _Notification Hub_ components. Specifically, it defines the target platforms that can receive notifications, as well as the notification's content.

## Table of Contents

1. [Available Target Platforms](#available-target-platforms)
   1. [Azure DevOps](#azure-devops)
   1. [Slack](#slack)
1. [Supported Notifications](#supported-notifications)
   1. [Deployments](#deployments)
      1. [SuccessfulDeployment](#successfuldeployment)
   1. [Docker Images](#docker-images)
      1. [FailedDockerImage](#faileddockerimage)
      1. [NewDockerImage](#newdockerimage)
   1. [Design Files](#design-files)
      1. [NewDesignFile](#newdesignfile)
   1. [NPM Packages](#npm-packages)
      1. [NewNpmPackageVersion](#newnpmpackageversion)
      1. [FailedNpmPackageVersion](#failednpmpackageversion)

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

#### `SuccessfulDeployment`

This notification signals a sucessful deployment:

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

#### `FailedDockerImage`

A notification to be sent whenever a _Docker_ image failed to build or could not be published in a container registry:

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

#### `NewDockerImage`

This notification should be fired when a new _Docker_ image was pushed to a container registry:

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

#### `NewDesignFile`:

An event to be dispatched when the Design team publishes a new version of a _Figma_ file.

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

#### `NewNpmPackageVersion`:

Signals a new version of an _NPM_ package. It is assumed that the package was built and published in a package registry:

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

#### `FailedNpmPackageVersion`

Trigger this notification when an error occurred while building or publishing a new version of an _NPM_ package:

```json
{
  "type": "FailedNpmPackageVersion",
  "group": "project-group",
  "release": {
    "tag": "<release-version>",
    "changelog": "<release-description>"
  },
  "links": {
    "sourceCode": "<source-code-url>",
    "pipeline": "<pipeline-url>",
    "registry": "<registry-url>"
  }
}
```
