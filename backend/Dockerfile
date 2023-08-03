FROM golang:1.19
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY *.go ./
RUN go build -v -o server
COPY --from=builder /app/server /app/server
CMD ["/app/server"]