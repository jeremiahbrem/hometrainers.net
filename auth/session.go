package main

import (
	"context"
	"net/http"

	"github.com/go-session/session"
)

type SessionApiType interface {
	Start(
		context context.Context,
		writer http.ResponseWriter,
		request *http.Request,
	) (session.Store, error)
}

type SessionApi struct{}

func (s *SessionApi) Start(
	context context.Context,
	writer http.ResponseWriter,
	request *http.Request,
) (session.Store, error) {
	return session.Start(context, writer, request)
}
