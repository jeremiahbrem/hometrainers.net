package mocks

import (
	"context"
	"net/http"

	"github.com/go-session/session"
)

type MockSession struct {
	storeFn func(session.Store)
}

func CreateSession(storeFn func(session.Store)) MockSession {
	return MockSession{storeFn}
}

func (mockSession *MockSession) Start(
	context context.Context,
	writer http.ResponseWriter,
	request *http.Request,
) (session.Store, error) {
	store, err := session.Start(context, writer, request)
	mockSession.storeFn(store)
	return store, err
}
