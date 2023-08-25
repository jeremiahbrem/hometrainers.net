FROM golang:1.15.2-alpine3.12 AS builder
WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o server

FROM alpine:3.12
COPY --from=builder /app/server /bin
COPY --from=builder /app/static /static
ENTRYPOINT [ "/bin/server" ]