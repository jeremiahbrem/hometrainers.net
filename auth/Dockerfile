FROM golang:1.19

WORKDIR /app

COPY . .
RUN go build -o /auth

RUN if [ "$ENVIRONMENT" == "PROD" ]; \
  curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.6.1/cloud-sql-proxy.linux.amd64; fi

RUN if [ "$ENVIRONMENT" == "PROD" ]; \
  chmod +x cloud-sql-proxy

ARG POSTGRES_HOST

EXPOSE 9096

CMD if [ "$ENVIRONMENT" == "PROD" ]; \
    then ./cloud-sql-proxy $POSTGRES_HOST & /auth; \
    else /auth; fi
