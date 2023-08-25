FROM golang:1.19
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o /backend
EXPOSE 8080
CMD ["/backend"]