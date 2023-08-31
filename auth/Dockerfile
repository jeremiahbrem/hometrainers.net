FROM golang:1.19 as prod

WORKDIR /app

ARG POSTGRES_HOST

EXPOSE 9096

RUN curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.6.1/cloud-sql-proxy.linux.amd64

RUN chmod +x cloud-sql-proxy
RUN mkdir /cloudsql

COPY . .
RUN go build -o /auth

CMD ./cloud-sql-proxy --unix-socket /cloudsql $POSTGRES_HOST & /auth

FROM golang:1.19 as dev

WORKDIR /app

COPY . .
RUN go build -o /auth

EXPOSE 9096

CMD ["/auth"]