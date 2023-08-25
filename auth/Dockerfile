FROM golang:1.19
WORKDIR /app
ADD ./static /static
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
COPY ./static ./static
RUN ls /app/static
RUN ls /app
RUN go build -o /auth
EXPOSE 9096
CMD ["/auth"]