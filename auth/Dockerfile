FROM golang:1.19

WORKDIR /app
ADD . /static

COPY go.mod .
COPY go.sum .

RUN go mod download
COPY *.go ./

COPY ./static ./static

RUN go build -o /auth

CMD [ "/auth" ]