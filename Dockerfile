FROM heroiclabs/nakama-pluginbuilder:3.16.0 AS builder

ENV GO111MODULE on
ENV CGO_ENABLED 1
ENV GOPRIVATE "sk/hello-nakama"

WORKDIR /backend
COPY . .

RUN go build --trimpath --mod=vendor --buildmode=plugin -o ./backend.so

FROM heroiclabs/nakama:3.16.0

COPY --from=builder /backend/build/*.js /nakama/data/modules/build/
COPY --from=builder /backend/local.yml /nakama/data/
COPY /data/core/*.json /nakama/data/core/
