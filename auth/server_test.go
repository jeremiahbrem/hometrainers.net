package main

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/go-session/session"
	"github.com/stretchr/testify/assert"
)

func TestGetLogin(t *testing.T) {
	router := setupRouter(ProvideSessionApi)

	w := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/login", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Contains(t, w.Body.String(), "Login")
}

func TestPostLogin(t *testing.T) {
	router := setupRouter(ProvideSessionApi)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("username", "john.doe")
	form.Add("password", "12345")

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
	assert.NotContains(t, w.Body.String(), "Login")
}

type MockSessionApi struct {
	valFound bool
}

type MockStore struct {
	ctx      context.Context
	valFound bool
}

func (s *MockStore) Context() context.Context          { return nil }
func (s *MockStore) SessionID() string                 { return "" }
func (s *MockStore) Set(key string, value interface{}) {}

func (s *MockStore) Get(key string) (interface{}, bool) {
	if key == "ReturnUri" {
		form := url.Values{}
		form.Add("client_id", "222222")
		form.Add("code_challenge", "Qn3Kywp0OiU4NK_AFzGPlmrcYJDJ13Abj_jdL08Ahg8%3D")
		form.Add("code_challenge_method", "S256")
		form.Add("redirect_uri", "http://localhost:3000/api/auth/callback/auth")
		form.Add("response_type", "code")
		form.Add("scope", "all")
		form.Add("state", "SMtRWUWwaryeP6sI7CS4ynDMwpdRGRqdFgM0D_k-qtI")
		return form, s.valFound
	}
	return "john.doe", s.valFound
}

func (s *MockStore) Delete(key string) interface{} { return nil }
func (s *MockStore) Save() error                   { return nil }
func (s *MockStore) Flush() error                  { return nil }

func (s *MockSessionApi) Start(
	context context.Context,
	writer http.ResponseWriter,
	request *http.Request,
) (session.Store, error) {
	store := &MockStore{ctx: context, valFound: s.valFound}
	return store, nil
}

func TestAuthHandlerLoggedIn(t *testing.T) {
	w := httptest.NewRecorder()

	session := MockSessionApi{valFound: true}

	provider := func(c context.Context) SessionApiType { return &session }
	router := setupRouter(provider)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/oauth/authorize", w.Header().Get("Location"))
}

func TestAuthHandlerNotLoggedOut(t *testing.T) {
	w := httptest.NewRecorder()

	session := MockSessionApi{valFound: false}

	provider := func(c context.Context) SessionApiType { return &session }
	router := setupRouter(provider)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
}

func TestOauthAuthorize(t *testing.T) {
	session := MockSessionApi{valFound: true}

	provider := func(c context.Context) SessionApiType { return &session }
	router := setupRouter(provider)

	w := httptest.NewRecorder()

	authReq, _ := http.NewRequest("GET", "/oauth/authorize", nil)

	router.ServeHTTP(w, authReq)

	expected := []string{
		"http://localhost:3000/api/auth/callback/auth",
		"code=",
		"state=",
	}

	for _, val := range expected {
		assert.Contains(t, w.Header().Get("Location"), val)
	}
}
