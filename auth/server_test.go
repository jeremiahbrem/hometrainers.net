package main

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"server/mocks"
	"server/models"
	"server/services"
	"server/users"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-session/session"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var testUser = "test-user"
var testName = "Tester"
var testPassword = "test-password"
var validationCode = "abc123"
var now = time.Date(2023, 4, 1, 10, 0, 0, 0, time.Local)

func Setup() *gorm.DB {
	godotenv.Load(".env")

	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})

	db.AutoMigrate(&models.User{})

	password, _ := users.HashPassword(testPassword)

	db.Exec(
		"insert into users (name, email, password, validated) values(?,?,?,?)",
		testName,
		testUser,
		password,
		true,
	)

	return db
}

func Teardown(db *gorm.DB) {
	sql := `
		delete from users;
	`
	db.Exec(sql)
}

func SetupRouter(
	db *gorm.DB,
	args ...interface{},
) *gin.Engine {

	mockSession := (services.SessionApiType)(nil)
	email := &mocks.MockEmailService{}
	codeGen := &mocks.MockCodeGenerator{Code: "default"}
	clock := &mocks.MockClock{}

	if args != nil {
		for _, arg := range args {
			if v, ok := arg.(services.SessionApiType); ok {
				mockSession = v.(*mocks.MockSession)
			}
			if v, ok := arg.(services.EmailServiceType); ok {
				email = v.(*mocks.MockEmailService)
			}
			if v, ok := arg.(services.CodeGeneratorType); ok {
				codeGen = v.(*mocks.MockCodeGenerator)
			}

			if v, ok := arg.(services.ClockType); ok {
				clock = v.(*mocks.MockClock)
			}
		}
	}

	var sessionArg services.SessionApiType
	if mockSession != nil {
		sessionArg = mockSession
	} else {
		sessionArg = &services.SessionApi{}
	}

	serviceProvider := services.CreateServiceProvider(
		sessionArg,
		db,
		&mocks.MockOauthServer{},
		email,
		codeGen,
		clock,
	)

	router := setupRouter(&serviceProvider)

	return router
}

func TestGetLogin(t *testing.T) {
	db := Setup()
	router := SetupRouter(db)

	defer Teardown(db)

	w := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/login", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, 200, w.Code)
	assert.Contains(t, w.Body.String(), "Login")
}

func TestPostLogin(t *testing.T) {
	db := Setup()
	router := SetupRouter(db)

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

func TestPostLoginUserNotFound(t *testing.T) {
	db := Setup()
	router := SetupRouter(db)

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

func TestPostLoginUserIncorrectPassword(t *testing.T) {
	db := Setup()
	router := SetupRouter(db)

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

func TestPostLoginUserNotValidated(t *testing.T) {
	db := Setup()

	mockClock := &mocks.MockClock{Time: now}

	expiry := mockClock.AddTime(now, 24, 0, 0)

	db.Exec("update users set validated = ?, code_expiration = ?", false, expiry)

	router := SetupRouter(db, mockClock)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", testPassword)

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Login")
	assert.Contains(t, w.Body.String(), "Email verification required. Please check your email for a verification link.")
}

func TestPostLoginPendingUserExpired(t *testing.T) {
	db := Setup()

	mockClock := &mocks.MockClock{Time: now}

	expiry := mockClock.AddTime(now, -24, 0, 0)

	db.Exec("update users set validated = ?, code_expiration = ?", false, expiry)

	router := SetupRouter(db, mockClock)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", testPassword)

	req, _ := http.NewRequest("POST", "/login", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Login")
	assert.Contains(t, w.Body.String(), "User not found")

	var user *models.User
	notFoundErr := db.Where("email = ?", testUser).First(&user).Error

	assert.ErrorContains(t, notFoundErr, "record not found")
}

func TestAuthHandlerLoggedIn(t *testing.T) {
	db := Setup()

	w := httptest.NewRecorder()

	storeFn := func(store session.Store) {
		store.Set("LoggedInUserID", testUser)
		store.Save()
	}

	mockSession := mocks.CreateSession(storeFn)

	router := SetupRouter(db, &mockSession)

	defer Teardown(db)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/oauth/authorize", w.Header().Get("Location"))
}

func TestAuthHandlerNotLoggedOut(t *testing.T) {
	db := Setup()

	w := httptest.NewRecorder()

	router := SetupRouter(db)

	defer Teardown(db)

	req, _ := http.NewRequest("GET", "/auth", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/auth", w.Header().Get("Location"))
}

func TestOauthAuthorize(t *testing.T) {
	db := Setup()

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

	router := SetupRouter(db, &mockSession)

	defer Teardown(db)

	w := httptest.NewRecorder()

	authReq, _ := http.NewRequest("GET", "/oauth/authorize", nil)

	router.ServeHTTP(w, authReq)

	assert.Equal(t, authReq.Form, form)
}

func SetupUnValidatedUser(
	db *gorm.DB,
) (*gorm.DB, services.ClockType) {
	mockClock := &mocks.MockClock{Time: now}

	expiry := mockClock.AddTime(now, 24, 0, 0)

	db.Exec(
		"update users set validated = ?, code_expiration = ?, validation_code = ?",
		false,
		expiry,
		validationCode,
	)

	return db, mockClock
}

func TestEmailValidated(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := fmt.Sprintf("/validate-email?code=%s&email=%s", validationCode, testUser)

	req, _ := http.NewRequest("GET", url, nil)

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Thank you for verifying your email. Your account is now active.")
	assert.NotContains(t, w.Body.String(), "Resend code")

	var user *models.User
	db.Where("email = ?", testUser).First(&user)

	assert.True(t, user.Validated)
}

func TestValidateEmailNoCode(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := fmt.Sprintf("/validate-email?email=%s", testUser)

	req, _ := http.NewRequest("GET", url, nil)

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Please check your email for a verification link to activate your account")
	assert.Contains(t, w.Body.String(), "Resend code")
}

func TestValidateNoEmail(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := "/validate-email"

	req, _ := http.NewRequest("GET", url, nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/signup", w.Header().Get("Location"))
}

func TestValidateUserNotFound(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := "/validate-email?email=other"

	req, _ := http.NewRequest("GET", url, nil)

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "User other not found")
	assert.NotContains(t, w.Body.String(), "Resend code")
}

func TestValidateUserInvalidCode(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := fmt.Sprintf("/validate-email?email=%s&code=other", testUser)

	req, _ := http.NewRequest("GET", url, nil)

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Invalid code")
	assert.Contains(t, w.Body.String(), "Resend code")
}

func TestPostValidateResend(t *testing.T) {
	db := Setup()

	mockCodeGen := mocks.MockCodeGenerator{
		Code: "new-code",
	}

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock, &mockCodeGen)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := fmt.Sprintf("/validate-email?email=%s", testUser)

	req, _ := http.NewRequest("POST", url, nil)

	router.ServeHTTP(w, req)

	assert.NotContains(t, w.Body.String(), "Resend code")
	assert.Contains(t, w.Body.String(), "Code has been sent. Please check your email for a verification link to activate your account")

	var user *models.User
	db.Where("email = ?", testUser).First(&user)

	assert.Equal(t, user.ValidationCode, "new-code")
}

func TestPostValidateNoEmail(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := "/validate-email"

	req, _ := http.NewRequest("POST", url, nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "/signup", w.Header().Get("Location"))
}

func TestPostValidateUserNotFound(t *testing.T) {
	db := Setup()

	db, mockClock := SetupUnValidatedUser(db)

	router := SetupRouter(db, &mockClock)

	w := httptest.NewRecorder()

	defer Teardown(db)

	url := "/validate-email?email=other"

	req, _ := http.NewRequest("POST", url, nil)

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "User other not found")
	assert.NotContains(t, w.Body.String(), "Resend code")
}

func TestSignupSuccess(t *testing.T) {
	db := Setup()

	db.Exec("delete from users")

	mockClock := mocks.MockClock{Time: now}
	mockEmail := mocks.MockEmailService{}
	codeGen := mocks.MockCodeGenerator{Code: "testing-code"}

	expiry := mockClock.AddTime(now, 24, 0, 0)

	router := SetupRouter(db, &mockClock, &codeGen, &mockEmail)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", testPassword)
	form.Add("name", testName)

	req, _ := http.NewRequest("POST", "/signup", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Equal(t, mockEmail.VerificationEmail, testUser)
	assert.Equal(t, mockEmail.ValidationCode, "testing-code")

	var user *models.User
	db.Where("email = ?", testUser).First(&user)

	assert.True(t, user.CodeExpiration.Equal(expiry))
	assert.Equal(t, user.ValidationCode, "testing-code")
	assert.Equal(t, user.Name, testName)

	assert.Equal(t, fmt.Sprintf("/validate-email?email=%s", testUser), w.Header().Get("Location"))
}

func TestSignupAlreadyExists(t *testing.T) {
	db := Setup()

	router := SetupRouter(db)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", testPassword)
	form.Add("name", testName)

	req, _ := http.NewRequest("POST", "/signup", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), fmt.Sprintf("Email %s already exists", testUser))
}

func TestSignupMissingField(t *testing.T) {
	db := Setup()

	db.Exec("delete from users")

	router := SetupRouter(db)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", testPassword)
	form.Add("name", "")

	req, _ := http.NewRequest("POST", "/signup", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Invalid field: name")
}

func TestSignupInvalidPassword(t *testing.T) {
	db := Setup()

	db.Exec("delete from users")

	router := SetupRouter(db)

	defer Teardown(db)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", testUser)
	form.Add("password", "short")
	form.Add("name", testName)

	req, _ := http.NewRequest("POST", "/signup", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Password must be a minimum of 8 characters")
}

func TestSignupGet(t *testing.T) {
	db := Setup()

	router := SetupRouter(db)

	defer Teardown(db)

	w := httptest.NewRecorder()

	req, _ := http.NewRequest("GET", "/signup", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		"Sign up",
		"Please enter your email",
		"Please enter your password",
	}

	for _, val := range expected {
		assert.Contains(t, w.Body.String(), val)
	}
}
