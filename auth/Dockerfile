FROM golang:1.19
WORKDIR /app
COPY . .
RUN go build -o /auth
EXPOSE 8080
CMD ["/auth"]