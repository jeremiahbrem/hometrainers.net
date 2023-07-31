FROM golang:1.19
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN go build -o /backend
EXPOSE 8080
CMD ["/backend"]

#docker run --publish 8080:8080 backend