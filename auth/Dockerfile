FROM golang:1.19
WORKDIR /app
RUN go mod download
COPY . .
RUN go build -o /auth
EXPOSE 8080
CMD ["/auth"]