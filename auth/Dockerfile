FROM golang:1.19 as dev

WORKDIR /app

RUN curl -o cloudsql https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.6.1/cloud-sql-proxy.linux.amd64

RUN chmod +x cloudsql

COPY . .
RUN go build -o /auth

ARG POSTGRES_HOST

EXPOSE 9096

CMD ./cloudsql $POSTGRES_HOST & /auth; else /auth

FROM golang:1.19 as prod

WORKDIR /app

COPY . .
RUN go build -o /auth

EXPOSE 9096

CMD ["/auth"]