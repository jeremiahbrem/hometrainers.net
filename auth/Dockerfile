FROM golang:1.19
ADD . /app
WORKDIR /app
RUN go mod download
RUN go build -o /auth
EXPOSE 9096
CMD ["/auth"]