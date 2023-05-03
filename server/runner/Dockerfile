# syntax=docker/dockerfile:experimental

ARG NODEJS_VERSION=19.6.0
ARG ALPINE_VERSION=3.17

FROM node:${NODEJS_VERSION}-alpine${ALPINE_VERSION} AS dev-builder

RUN npm i -g pnpm

ARG WORKDIR=/home/node/app
WORKDIR ${WORKDIR}

# Service runner
COPY server/runner/package*.json server/runner/
COPY server/runner/tsconfig.json server/runner/

# Other Packages
COPY packages/nodejs/models packages/nodejs/models

# General configs
COPY package.json .
COPY nx.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

# pnpm install
RUN --mount=type=cache,id=yarn,sharing=locked,target=/usr/local/share/.cache/yarn \
    pnpm install

# Service runner source code
COPY server/runner/src server/runner/src
COPY server/runner/tests server/runner/tests

# pnpm run build
RUN pnpm build

########################################################################################################################
########################################################################################################################
########################################################################################################################

FROM dev-builder AS prod-builder

RUN --mount=type=cache,id=yarn,sharing=locked,target=/usr/local/share/.cache/yarn \
    pnpm install --production --ignore-scripts --frozen-lockfile

# ########################################################################################################################
# ########################################################################################################################
# ########################################################################################################################

FROM node:${NODEJS_VERSION}-alpine${ALPINE_VERSION}
USER node

ARG WORKDIR=/home/node/app/
WORKDIR ${WORKDIR}

ARG BUILD_SOURCE_REF_NAME
RUN echo $BUILD_SOURCE_REF_NAME >> /etc/git_tag

# General configs
COPY --from=prod-builder --chown=node:node ${WORKDIR}/package.json .
COPY --from=prod-builder --chown=node:node ${WORKDIR}/nx.json .
COPY --from=prod-builder --chown=node:node ${WORKDIR}/pnpm-lock.yaml .
COPY --from=prod-builder --chown=node:node ${WORKDIR}/pnpm-workspace.yaml .
COPY --from=prod-builder --chown=node:node ${WORKDIR}/node_modules .

# Other packages
COPY packages/nodejs/models packages/nodejs/models

# Service runner source code
COPY --from=prod-builder --chown=node:node ${WORKDIR}/server/runner/dist ${WORKDIR}/server/runner
COPY --from=prod-builder --chown=node:node ${WORKDIR}/server/runner/node_modules ${WORKDIR}/server/runner
COPY --from=prod-builder --chown=node:node ${WORKDIR}/server/runner/package*.json ${WORKDIR}/server/runner

CMD ["yarn", "run", "start"]
