package tests

import (
	"main/services"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestPostContact(t *testing.T) {
	godotenv.Load("../.env")

	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})

	mockEmailService := MockEmailService{}

	router := SetupRouter(db, &mockEmailService)

	w := httptest.NewRecorder()

	form := url.Values{}
	form.Add("email", "test@example.com")
	form.Add("name", "Tester")
	form.Add("message", "This is a contact form message")

	req, _ := http.NewRequest("POST", "/contact", strings.NewReader(form.Encode()))
	req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	expectedArgs := services.EmailArgs{
		To:      "support@hometrainers.net",
		Subject: "Contact Form",
		Body:    "This is a contact form message\nSent from Tester test@example.com",
	}

	assert.Equal(t, expectedArgs, mockEmailService.Args)
}
