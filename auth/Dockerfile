FROM golang:1.19
RUN mkdir -p /auth/static
COPY go.mod go.sum /auth/
RUN go mod download
COPY *.go ./ /auth/
COPY static /auth/static
RUN go build -o /auth
EXPOSE 9096
CMD ["/backend"]