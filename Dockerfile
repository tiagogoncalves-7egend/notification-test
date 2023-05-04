ARG NODEJS_VERSION=20.0.0
ARG ALPINE_VERSION=3.17

# -------------------------------------------
# Install pnpm and other dependencies
# -------------------------------------------
FROM node:${NODEJS_VERSION}-alpine${ALPINE_VERSION} AS secured

# Fixes medium vulnerability (CVE-2023-1255):
# https://avd.aquasec.com/nvd/cve-2023-1255
RUN apk add \
    libcrypto3==3.0.8-r4 \
    libssl3==3.0.8-r4

# -------------------------------------------
# Install pnpm and other dependencies
# -------------------------------------------
FROM secured AS pnpm
RUN npm i -g pnpm

# -------------------------------------------
# Build the application
# -------------------------------------------
FROM pnpm as builder
WORKDIR /root
COPY pnpm-workspace.yaml .
COPY package.json .
COPY packages packages
COPY server server
ARG PROJECT

RUN pnpm --filter=${PROJECT} --prod deploy build

# -------------------------------------------
# Run the application
# -------------------------------------------
FROM secured as application
ARG WORKDIR=/home/node/app
WORKDIR ${WORKDIR}
COPY --from=builder /root/build/dist dist
COPY --from=builder /root/build/node_modules node_modules
COPY --from=builder /root/build/package.json .

ARG NODEJS_VERSION
ARG ALPINE_VERSION
ARG COMMIT
RUN ( \
    echo "---------------------------------------------"; \
    echo "Base Image"; \
    echo "---------------------------------------------"; \
    echo "ALPINE_VERSION=${ALPINE_VERSION}"; \
    echo "NODEJS_VERSION=${NODEJS_VERSION}"; \
    echo "---------------------------------------------"; \
    echo "Repository"; \
    echo "---------------------------------------------"; \
    echo "COMMIT=${COMMIT}"; \
    ) > build.txt

CMD ["npm", "start"]
