# syntax=docker/dockerfile:experimental

ARG NODEJS_VERSION=19.6.0
ARG ALPINE_VERSION=3.17

FROM node:${NODEJS_VERSION}-alpine${ALPINE_VERSION} as dev-builder

ARG WORKDIR=/home/node/app
WORKDIR ${WORKDIR}

COPY src src
COPY tests tests
COPY package*.json .
COPY yarn.lock .
COPY tsconfig.json .

RUN --mount=type=secret,id=npm,required=true,uid=1000,gid=1000,target=/home/node/.npmrc \
    --mount=type=cache,id=yarn,sharing=locked,target=/usr/local/share/.cache/yarn \
    yarn install

RUN yarn run build

########################################################################################################################
########################################################################################################################
########################################################################################################################

FROM dev-builder as prod-builder

RUN --mount=type=cache,id=yarn,sharing=locked,target=/usr/local/share/.cache/yarn \
    yarn install --production --ignore-scripts --frozen-lockfile

########################################################################################################################
########################################################################################################################
########################################################################################################################

FROM node:${NODEJS_VERSION}-alpine${ALPINE_VERSION}
USER node

ARG WORKDIR=/home/node/app
WORKDIR ${WORKDIR}

COPY --from=prod-builder --chown=node:node ${WORKDIR}/dist ./dist
COPY --from=prod-builder --chown=node:node ${WORKDIR}/node_modules ./node_modules
COPY --from=prod-builder --chown=node:node ${WORKDIR}/package*.json .
COPY --from=prod-builder --chown=node:node ${WORKDIR}/yarn.lock .

CMD ["yarn", "run", "start"]
