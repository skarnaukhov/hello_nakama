FROM node:alpine AS node-builder

ENV GO111MODULE on
ENV CGO_ENABLED 1
ENV GOPRIVATE "sk/hello-nakama"

WORKDIR /backend
COPY . .


FROM heroiclabs/nakama:3.16.0

COPY --from=node-builder /backend/dist/*.js /nakama/data/modules/dist/
COPY --from=node-builder /backend/local.yml /nakama/data/
COPY /data/core/*.json /nakama/data/core/
