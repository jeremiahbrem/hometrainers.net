FROM golang:1.20

WORKDIR /app
ADD . /api
ADD . /static

COPY go.mod .
COPY go.sum .

RUN go mod download

COPY ./api ./api
COPY ./static ./static
RUN ls /app

RUN go build -o ./auth ./api

CMD [ "./auth" ]