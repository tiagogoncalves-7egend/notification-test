# Notification Hub (API)

This _nodejs_ app is an _express_ server written in _TypeScript_ that exposes one single endpoint for publishing notifications. It's a microservice that receives `NotificationRequests`, validates the `Access Token` and sends the _notifications_ asynchronously. It also runs on a _Docker_ container.

## How to Run

Just clone the repository and run `make`. You should get fully working environment:

```bash
make
```

## Publish Requests

### POST /v1/notifications

This endpoint accepts a _JSON_ body with the `Notification` to publish, the target `Platforms` and an `Access Token`. The `Access Token` is sent using the `Authentication` header with the following format:

-   `Authentication: Bearer <access-token>`. The request will only passthrough if the provided `Access Token` is in the access tokens _whitelist_.

### Body

The _JSON_ body should have the following properties:

-   `platforms`: (_array_) Where to publish the `Notification` event.
-   `notification`: (_object_) The notification object containing the message and other related data to be published.

> Check out the [`runner`](https://gitlab.com/7egend/projects/home/microservices/notification-hub/server/api) repository to get to full list of supported target platforms and notification events.

```json
{
    "platforms": [
        {
            "type": "slack-channel-members",
            "channel": "designops"
        },
        {
            "type": "azure-work-item",
            "workItem": { "id": 1, "project": "changelog" }
        }
    ],
    "notification": {
        "type": "SuccessfulDeployment",
        "author": "John doe",
        "createdAt": "2023-01-06T16:56:19+0000",
        "environment": "development",
        "group": "DesignOps",
        "subgroup": "devops/ansible",
        "release": {
            "tag": "latest",
            "changelog": "Fixed a fatal crash"
        },
        "links": {
            "sourceCode": "https://7egend.cr"
        }
    }
}
```

Don't forget to include your `Access Token`. Example:

```bash
curl -X POST "http://hub.7egend.cr/v1/notifications" \
		-H "Authorization: Bearer ${access_token}" \
		-H "Content-Type: application/json" \
		-d "${notification}"
```

## Responses

You can expect 3 responses from the `[POST] /v1/notifications` endpoint:

1. `201 OK`: The request is valid and it was scheduled to be published
2. `403 Forbidden`: The `Access Token` is missing or it's not in the _whitelist_.
3. `500 Internal Server Error`: The request is valid but there was a problem while trying to enqueue it to the _RabbitMQ_ instance.

## Tests

You can test the application flow running:

```bash
yarn test
```
