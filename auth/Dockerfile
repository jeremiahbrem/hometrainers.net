FROM golang:1.19
RUN mkdir -p /server/static
COPY go.mod go.sum /server/
WORKDIR /server
RUN go mod download
COPY *.go / 
COPY static /static
RUN go build -o /
EXPOSE 9096
CMD ["/"]