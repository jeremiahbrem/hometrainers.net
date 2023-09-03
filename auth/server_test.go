package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"os"
	"server/database"
	"server/mocks"
	"server/models"
	"strings"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var Db *gorm.DB

func Setup() {
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
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	db.AutoMigrate(&models.User{})

	Db = db
}

func Teardown() {
	sql := `
		delete from users;
	`
	Db.Exec(sql)
}

func TestGetLogin(t *testing.T) {
	Setup()
	defer Teardown()

	router := setupRouter(&SessionApi{}, Db)

	w := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/login", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Contains(t, w.Body.String(), "Login")
}

func TestPostLogin(t *testing.T) {
	Setup()
	defer Teardown()

	router := setupRouter(&SessionApi{}, Db)

	password, _ := HashPassword("12345")

	sql := fmt.Sprintf(`
		insert into users (email, name, password)
		values ('john.doe', 'john doe', '%s')
	`, password)

	database.DB.Db.Exec(sql)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", "john.doe")
	form.Add("password", "12345")

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
	assert.NotContains(t, w.Body.String(), "Login")
}

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

var uid = "john.doe"

func TestAuthHandlerLoggedIn(t *testing.T) {
	Setup()
	defer Teardown()

	w := httptest.NewRecorder()

	session := mocks.MockSessionApi{
		ValFound: true,
		Form:     form,
		Uid:      uid,
	}

	router := setupRouter(&session, Db)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/oauth/authorize", w.Header().Get("Location"))
}

func TestAuthHandlerNotLoggedOut(t *testing.T) {
	Setup()
	defer Teardown()

	w := httptest.NewRecorder()

	session := mocks.MockSessionApi{
		ValFound: false,
		Form:     form,
		Uid:      uid,
	}

	router := setupRouter(&session, Db)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
}

func TestOauthAuthorize(t *testing.T) {
	Setup()
	defer Teardown()

	session := mocks.MockSessionApi{
		ValFound: true,
		Form:     form,
		Uid:      uid,
	}

	router := setupRouter(&session, Db)

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
