package mocks

import (
	"context"
	"net/http"
	"net/url"

	"github.com/go-session/session"
)

type MockSessionApi struct {
	ValFound bool
	Form     url.Values
	Uid      string
}

type MockStore struct {
	ctx      context.Context
	valFound bool
	form     url.Values
	uid      string
}

func (s *MockStore) Context() context.Context          { return nil }
func (s *MockStore) SessionID() string                 { return "" }
func (s *MockStore) Set(key string, value interface{}) {}

func (s *MockStore) Get(key string) (interface{}, bool) {
	if key == "ReturnUri" {
		return s.form, s.valFound
	}
	return s.uid, s.valFound
}

func (s *MockStore) Delete(key string) interface{} { return nil }
func (s *MockStore) Save() error                   { return nil }
func (s *MockStore) Flush() error                  { return nil }

func (s *MockSessionApi) Start(
	context context.Context,
	writer http.ResponseWriter,
	request *http.Request,
) (session.Store, error) {

	store := &MockStore{
		ctx:      context,
		valFound: s.ValFound,
		form:     s.Form,
		uid:      s.Uid,
	}
	return store, nil
}
