FROM node:19.6-alpine3.17

# Fixes medium vulnerability (CVE-2023-1255):
# https://avd.aquasec.com/nvd/cve-2023-1255
RUN apk add --no-cache \
    libcrypto3==3.0.8-r4 \
    libssl3==3.0.8-r4

# Development dependencies (nx)
RUN apk add --no-cache \
    g++==12.2.1_git20220924-r4 \
    gcc==12.2.1_git20220924-r4 \
    make==4.3-r1 \
    py3-pip==22.3.1-r1 \
    python3==3.10.11-r0

# Optionally install git
RUN apk add --no-cache \
    git==2.38.5-r0

# Node.js related tools
RUN npm i -g \
    nx@16.0.3 \
    pnpm@8.4.0
