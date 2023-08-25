FROM golang:1.15.2-alpine3.12 AS builder
WORKDIR /app
COPY . .
RUN go build -o auth

FROM alpine:3.12
COPY --from=builder /app/auth /
COPY --from=builder /app/static /static
ENTRYPOINT [ "/auth" ]