package mocks

import (
	"net/http"

	"github.com/go-oauth2/oauth2/v4"
)

type MockOauthServer struct{}

func (srv *MockOauthServer) HandleAuthorizeRequest(w http.ResponseWriter, r *http.Request) error {
	return nil
}
func (srv *MockOauthServer) HandleTokenRequest(w http.ResponseWriter, r *http.Request) error {
	return nil
}
func (srv *MockOauthServer) ValidationBearerToken(r *http.Request) (oauth2.TokenInfo, error) {
	return nil, nil
}
