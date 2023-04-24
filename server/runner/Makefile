prefix = notification_hub_runner
name ?= notification-hub/runner
version ?= latest
registry ?= registry.gitlab.com/7egend/projects/home/microservices/notification-hub/server/runner

# --------------------------------------------------------------------
# Setup and start the project.
# --------------------------------------------------------------------
bootstrap: docker-compose
bootstrap: build
bootstrap:
	@docker-compose up -d

	@# --------------------------------------------------------------------
	@# Show 3rd party placeholders and other settings with no default values.
	@# --------------------------------------------------------------------
	@echo "-------------------------------------------"
	@echo "The following placeholder values cannot be"
	@echo "replaced automatically. Please, review and"
	@echo "edit one by one:"
	@echo "-------------------------------------------"
	@make missing-values
	@echo "-------------------------------------------"
	@echo ""

	@echo "Done."

# --------------------------------------------------------------------
# Creates one docker images:
# 	1. ${name}/release:${version}: The production ready image
# --------------------------------------------------------------------
build: tag ?= ${name}/release:${version}
build:
	@DOCKER_BUILDKIT=1 docker build \
		--secret id=npm,src=${HOME}/.npmrc \
		-t ${tag} \
		.

# --------------------------------------------------------------------
# Uses buildx to build and push the image to the container registry.
# --------------------------------------------------------------------
push: tag ?= ${registry}:${version}
push:
	docker buildx build \
		--secret id=npm,src=${HOME}/.npmrc \
		--build-arg COMMIT=${commit} \
		--platform linux/amd64,linux/arm64 \
		--tag ${tag} \
		--push \
		.

# --------------------------------------------------------------------
# Creates an `.env` and an `.app.env` file with valid and synced
# values to run the project locally.
# --------------------------------------------------------------------
docker-compose: env-output ?= .env
docker-compose: app-env-output ?= .app.env
docker-compose:
	@if [ -s ${env-output} ]; then >&2 echo "You must delete '${env-output}' file before running this recipe." && exit 1; fi;
	@if [ -s ${app-env-output} ]; then >&2 echo "You must delete '${app-env-output}' file before running this recipe." && exit 1; fi;

	@# --------------------------------------------------------------------
	@# Generates passwords for the new environment.
	@# --------------------------------------------------------------------
	$(eval rabbitmq_password := $(shell make password))

	@# --------------------------------------------------------------------
	@# Outputs a valid `env` docker-compose file to run the project locally.
	@# --------------------------------------------------------------------
	@echo "Creating .env file..."
	@cat .env.example \
		| sed -r "s|<prefix>|${prefix}|" \
		| sed -r "s|<amqp-password>|${rabbitmq_password}|" \
		> ${env-output};

	@# --------------------------------------------------------------------
	@# Outputs a valid `.app.env` file to run the project locally.
	@# --------------------------------------------------------------------
	@echo "Creating .app.env file..."
	@cat .app.env.example \
		| sed -r "s|<rabbitmq-password>|${rabbitmq_password}|" \
		> ${app-env-output}

	@echo ""

	@# --------------------------------------------------------------------
	@# Show 3rd party placeholders and other settings with no default values.
	@# --------------------------------------------------------------------
	@echo "-------------------------------------------"
	@echo "The following placeholder values cannot be"
	@echo "replaced automatically. Please, review and"
	@echo "edit one by one:"
	@echo "-------------------------------------------"
	@make missing-values
	@echo "-------------------------------------------"
	@echo ""

# --------------------------------------------------------------------
# Runs a fresh new container of the "debug" image.
# It also configures SSH port forwarding.
# --------------------------------------------------------------------
sh:
	@DOCKER_BUILDKIT=1 docker run \
		-it \
		--rm \
		-v "$(shell pwd)":/home/node/app \
		${name}/release:${version} sh

# --------------------------------------------------------------------
# Outputs the list of messages between two commits.
# --------------------------------------------------------------------
changelog: from ?= 'main'
changelog: to ?= 'HEAD'
changelog:
	@[ "${from}" ] || ( echo "Missing [from] branch.\nUsage: make changelog [from=.+] [to=.+]\n"; exit 1; )
	@[ "${to}" ] || ( echo "Missing [to] branch.\nUsage: make changelog [from=.+] [to=.+]\n"; exit 1; )
	@git log ${from}..${to} | egrep -e "\[(.+)\]" | sed -e 's/[ \t]*//'

# --------------------------------------------------------------------
# Generates a random string.
# --------------------------------------------------------------------
password: alphabet ?= a-zA-Z1-9
password: length ?= 32
password:
	@cat /dev/urandom | env LC_ALL=C tr -dc "${alphabet}" | fold -w ${length}} | head -n 1

# --------------------------------------------------------------------
# Lists all placeholders that were not automatically replaced.
# --------------------------------------------------------------------
missing-values: filename ?= .env
missing-values:
	@cat ${filename} | grep -oE "<.+>" | sort | uniq -u

# --------------------------------------------------------------------
# Returns a value of the given key in `env_filename`.
# --------------------------------------------------------------------
env-value: env_filename ?= .env
env-value:
	@[ "${key}" ] || ( echo "Missing [key] variable.\nUsage: make env-value [key=.+]\n"; exit 1; )
	@echo $(shell cat ${env_filename} | grep -oE "${key}=(.+)" | sed -r "s|(.+)=(.+)|\2|")

# --------------------------------------------------------------------
# Publishes a message in the RabbitMQ server.
# --------------------------------------------------------------------
amqp-enqueue: baseUrl ?= http://localhost:15672
amqp-enqueue: username ?= runner
amqp-enqueue: queue ?= notifications
# amqp-enqueue: platforms ?= [{ \"type\": \"azure-work-item\", \"workItem\": { \"id\": 1, \"project\": \"changelog\" } }]
# amqp-enqueue: platforms ?= [{ \"type\": \"slack-channel\", \"channel\": \"changelog\" }]
# amqp-enqueue: platforms ?= [{ \"type\": \"slack-channel-members\", \"channel\": \"changelog\" }]
# amqp-enqueue: platforms ?= [{ \"type\": \"slack-member-email\", \"email\": \"tiago.barros@7egend.cr\" }]
# amqp-enqueue: platforms ?= [{ \"type\": \"slack-members-email\", \"emails\": [\"tiago.barros@7egend.cr\"] }]
amqp-enqueue: platforms ?= [{ \"type\": \"azure-work-item\", \"workItem\": { \"id\": 1, \"project\": \"changelog\" } }, { \"type\": \"slack-channel\", \"channel\": \"changelog\" }, { \"type\": \"slack-channel-members\", \"channel\": \"changelog\" }, { \"type\": \"slack-member-email\", \"email\": \"tiago.barros@7egend.cr\" }]
amqp-enqueue:
	$(eval rabbitmq_password := $(shell make env-value key=RABBITMQ_PASSWORD))
	curl -X POST "${baseUrl}/api/exchanges/%2F/amq.default/publish" \
		-H "Content-Type: application/json" \
		-u ${username}:${rabbitmq_password} \
		-d '{ "properties": { "delivery_mode": 2 }, "routing_key": "${queue}", "payload": "{ \"platforms\": ${platforms}, \"notification\": ${notification} }", "payload_encoding": "string" }'

# --------------------------------------------------------------------
# Posts a fake successful deployment notification.
# --------------------------------------------------------------------
successful-deployment-sample: notification ?= { \"type\": \"SuccessfulDeployment\", \"author\": \"John doe\", \"createdAt\": \"2023-01-06T16:56:19+0000\", \"environment\": \"development\", \"group\": \"DesignOps\", \"subgroup\": \"devops/ansible\", \"release\": { \"tag\": \"latest\", \"changelog\": \"Fixed a fatal crash\" }, \"links\": { \"sourceCode\": \"https://7egend.cr\" } }
successful-deployment-sample: amqp-enqueue

# --------------------------------------------------------------------
# Posts a fake new docker image notification.
# --------------------------------------------------------------------
new-docker-image-sample: notification ?= { \"type\": \"NewDockerImage\", \"author\": \"Tiago Gonçalves\", \"group\": \"DesignOps\", \"release\": { \"tag\": \"latest\", \"changelog\": \"update public holidays\" }, \"links\": { \"sourceCode\": \"https://gitlab.com/7egend/valencia-cf/devops/ansible\", \"image\": \"registry.gitlab.com/7egend/valencia-cf/devops/ansible:latest\" } }
new-docker-image-sample: amqp-enqueue

# --------------------------------------------------------------------
# Posts a fake failed docker image notification.
# --------------------------------------------------------------------
failed-docker-image-sample: notification ?= { \"type\": \"FailedDockerImage\", \"group\": \"DesignOps\", \"links\": { \"sourceCode\": \"https://gitlab.com/7egend/valencia-cf/devops/ansible\", \"image\": \"registry.gitlab.com/7egend/valencia-cf/devops/ansible:latest\", \"pipeline\": \"https://gitlab.com/7egend/valencia-cf/devops/ansible/container_registry\", \"registry\": \"https://gitlab.com\" } }
failed-docker-image-sample: amqp-enqueue

# --------------------------------------------------------------------
# Posts a fake new design file notification.
# --------------------------------------------------------------------
new-design-file-sample: notification ?= { \"type\": \"NewDesignFile\", \"author\": \"Tiago Barros\", \"createdAt\": \"2023-01-06T16:56:19+0000\", \"group\": \"DesignOps\", \"subgroup\": \"mobile/ios\", \"release\": { \"tag\": \"2.1.3\", \"changelog\": \"Added new features\" }, \"links\": { \"figma\": \"https://www.figma.com/file/yjGQhlaG8NPGb9pOPatuFe4ZE5FAdCb8\", \"azureWorkItem\": \"http://dev.azure.com/tiagobarros-7egend/Changelog/_workitems/edit/1\", \"report\": \"https://7egend.ams3.digitaloceanspaces.com/designops/changelog/report.html\" }, \"differences\": { \"added\": 10, \"removed\": 3, \"changed\": 6 } }
new-design-file-sample: amqp-enqueue
	