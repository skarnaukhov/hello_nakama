FROM node:alpine AS node-builder

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

WORKDIR /backend

COPY package*.json .
RUN npm install --loglevel verbose

COPY . .
RUN npm run build

FROM registry.heroiclabs.com/heroiclabs/nakama:3.21.1

COPY --from=node-builder /backend/dist/*.js /nakama/data/modules/dist/
COPY local.yml /nakama/data/
COPY /data/core/*.json /nakama/data/core/
