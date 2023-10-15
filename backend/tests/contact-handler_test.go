package tests

import (
	"bytes"
	"encoding/json"
	"main/controllers"
	"main/services"
	"net/http"
	"net/http/httptest"
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

	args := controllers.ContactArgs{
		Name:    "Tester",
		Email:   "test@example.com",
		Message: "This is a contact form message",
		To:      "support@hometrainers.net",
	}

	marshalled, _ := json.Marshal(args)

	req, _ := http.NewRequest("POST", "/contact", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	expectedArgs := services.EmailArgs{
		To:      "support@hometrainers.net",
		Subject: "Contact Form",
		Body:    "Message: This is a contact form message\n\nName: Tester\n\nEmail: test@example.com",
	}

	assert.Equal(t, expectedArgs, mockEmailService.Args)
}
