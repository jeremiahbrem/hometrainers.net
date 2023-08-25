FROM golang:1.19
WORKDIR /app
COPY go.mod go.sum ./
COPY ./static ./static
RUN go mod download
COPY *.go ./
RUN go build -o /auth
EXPOSE 8080
CMD ["/auth"]