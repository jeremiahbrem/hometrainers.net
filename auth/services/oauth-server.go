package services

import (
	"context"
	"log"
	"net/http"
	"time"

	"github.com/go-oauth2/oauth2/v4"
	"github.com/go-oauth2/oauth2/v4/errors"
	"github.com/go-oauth2/oauth2/v4/generates"
	"github.com/go-oauth2/oauth2/v4/manage"
	"github.com/go-oauth2/oauth2/v4/models"
	"github.com/go-oauth2/oauth2/v4/server"
	"github.com/golang-jwt/jwt"
	"github.com/jackc/pgx/v4"
	pg "github.com/vgarvardt/go-oauth2-pg/v4"
	"github.com/vgarvardt/go-pg-adapter/pgx4adapter"
)

type OauthServerType interface {
	HandleAuthorizeRequest(w http.ResponseWriter, r *http.Request) error
	HandleTokenRequest(w http.ResponseWriter, r *http.Request) error
	ValidationBearerToken(r *http.Request) (oauth2.TokenInfo, error)
}

type OauthServer struct {
	server *server.Server
}

func (oauth *OauthServer) HandleAuthorizeRequest(w http.ResponseWriter, r *http.Request) error {
	return oauth.server.HandleAuthorizeRequest(w, r)
}

func (oauth *OauthServer) HandleTokenRequest(w http.ResponseWriter, r *http.Request) error {
	return oauth.server.HandleTokenRequest(w, r)
}

func (oauth *OauthServer) ValidationBearerToken(r *http.Request) (oauth2.TokenInfo, error) {
	return oauth.server.ValidationBearerToken(r)
}

func CreateOauthServer(session SessionApiType, dsn string) OauthServerType {
	idvar := "222222"
	secretvar := "22222222"
	domainvar := "r"

	pgxConn, _ := pgx.Connect(context.Background(), dsn)

	manager := manage.NewDefaultManager()

	adapter := pgx4adapter.NewConn(pgxConn)
	tokenStore, _ := pg.NewTokenStore(adapter, pg.WithTokenStoreGCInterval(time.Minute))
	defer tokenStore.Close()

	clientStore, _ := pg.NewClientStore(adapter)

	clientStore.Create(&models.Client{
		ID:     idvar,
		Secret: secretvar,
		Domain: domainvar,
	})

	manager.MapTokenStorage(tokenStore)

	manager.MapClientStorage(clientStore)

	manager.MapAccessGenerate(generates.NewJWTAccessGenerate("", []byte("00000000"), jwt.SigningMethodHS512))

	srv := server.NewServer(server.NewConfig(), manager)

	srv.SetUserAuthorizationHandler(userAuthorizeHandler(session))

	srv.SetInternalErrorHandler(func(err error) (re *errors.Response) {
		log.Println("Internal Error:", err.Error())
		return
	})

	srv.SetResponseErrorHandler(func(re *errors.Response) {
		log.Println("Response Error:", re.Error.Error())
	})

	return &OauthServer{srv}
}

func userAuthorizeHandler(
	session SessionApiType,
) func(w http.ResponseWriter, r *http.Request) (userID string, err error) {
	return func(w http.ResponseWriter, r *http.Request) (userID string, err error) {
		store, err := session.Start(r.Context(), w, r)

		if err != nil {
			return
		}

		uid, ok := store.Get("LoggedInUserID")

		if !ok {
			if r.Form == nil {
				r.ParseForm()
			}

			store.Set("ReturnUri", r.Form)
			store.Save()

			w.Header().Set("Location", "/login")
			w.WriteHeader(http.StatusFound)
			return
		}

		userID = uid.(string)

		store.Delete("LoggedInUserID")
		store.Save()
		return
	}
}
