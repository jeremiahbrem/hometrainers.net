package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"server/mocks"
	"server/models"
	"server/services"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/go-session/session"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var testUser = "test-user"
var testName = "Tester"
var testPassword = "test-password"

func Setup() (*gorm.DB, string) {
	godotenv.Load(".env")

	dsn := fmt.Sprintf(
		"host=%s user=%s database=%s password=%s",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("TEST_DB"),
		os.Getenv("POSTGRES_PASSWORD"),
	)

	db, _ := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
	}))

	db.AutoMigrate(&models.User{})

	password, _ := HashPassword(testPassword)

	db.Exec(
		"insert into users (name, email, password) values(?,?,?)",
		testName,
		testUser,
		password,
	)

	return db, dsn
}

func Teardown(db *gorm.DB) {
	sql := `
		delete from users;
		delete from oauth2_tokens;
		delete from oauth2_clients;
	`
	db.Exec(sql)
}

func SetupRouter(
	db *gorm.DB,
	session services.SessionApiType,
	dsn string,
) *gin.Engine {
	oauthServer := services.CreateOauthServer(session, dsn)

	serviceProvider := services.CreateServiceProvider(
		session,
		db,
		oauthServer,
	)
	router := setupRouter(serviceProvider)

	return router
}

func TestGetLogin(t *testing.T) {
	db, dsn := Setup()
	router := SetupRouter(db, &services.SessionApi{}, dsn)

	defer Teardown(db)

	w := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/login", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Contains(t, w.Body.String(), "Login")
}

func TestPostLogin(t *testing.T) {
	db, dsn := Setup()
	router := SetupRouter(db, &services.SessionApi{}, dsn)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", testPassword)

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
	assert.NotContains(t, w.Body.String(), "Login")
}

func TestPostUserNotFound(t *testing.T) {
	db, dsn := Setup()
	router := SetupRouter(db, &services.SessionApi{}, dsn)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", "other-user")
	form.Add("password", testPassword)

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Login")
	assert.Contains(t, w.Body.String(), "User not found")
}

func TestPostUserIncorrectPassword(t *testing.T) {
	db, dsn := Setup()
	router := SetupRouter(db, &services.SessionApi{}, dsn)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", "bad-password")

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Login")
	assert.Contains(t, w.Body.String(), "Incorrect password")
}

func TestAuthHandlerLoggedIn(t *testing.T) {
	db, dsn := Setup()

	w := httptest.NewRecorder()

	storeFn := func(store session.Store) {
		store.Set("LoggedInUserID", testUser)
		store.Save()
	}

	mockSession := mocks.CreateSession(storeFn)

	router := SetupRouter(db, &mockSession, dsn)

	defer Teardown(db)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/oauth/authorize", w.Header().Get("Location"))
}

func TestAuthHandlerNotLoggedOut(t *testing.T) {
	db, dsn := Setup()

	w := httptest.NewRecorder()

	router := SetupRouter(db, &services.SessionApi{}, dsn)

	defer Teardown(db)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
}

func TestOauthAuthorize(t *testing.T) {
	db, dsn := Setup()

	var form = func() url.Values {
		form := url.Values{}
		form.Add("client_id", "222222")
		form.Add("code_challenge", "Qn3Kywp0OiU4NK_AFzGPlmrcYJDJ13Abj_jdL08Ahg8%3D")
		form.Add("code_challenge_method", "S256")
		form.Add("redirect_uri", "http://localhost:3000/api/auth/callback/auth")
		form.Add("response_type", "code")
		form.Add("scope", "all")
		form.Add("state", "SMtRWUWwaryeP6sI7CS4ynDMwpdRGRqdFgM0D_k-qtI")
		return form
	}()

	storeFn := func(store session.Store) {
		store.Set("LoggedInUserID", testUser)
		store.Set("ReturnUri", form)
		store.Save()
	}

	mockSession := mocks.CreateSession(storeFn)

	router := SetupRouter(db, &mockSession, dsn)

	defer Teardown(db)

	w := httptest.NewRecorder()

	authReq, _ := http.NewRequest("GET", "/oauth/authorize", nil)

	router.ServeHTTP(w, authReq)

	expected := []string{
		"http://localhost:3000/api/auth/callback/auth",
		"code=",
		"state=SMtRWUWwaryeP6sI7CS4ynDMwpdRGRqdFgM0D_k-qtI",
	}
	for _, val := range expected {
		assert.Contains(t, w.Header().Get("Location"), val)
	}
}
