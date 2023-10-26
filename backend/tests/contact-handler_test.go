package tests

import (
	"bytes"
	"encoding/json"
	"main/controllers"
	"main/models"
	"main/services"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupContactTests() *gorm.DB {
	godotenv.Load("../.env")

	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})

	db.AutoMigrate(&models.Page{}, &models.Goal{}, &models.Profile{})

	db.Exec(
		"insert into profiles (email, name, type) values(?,?,?)",
		trainerEmail,
		"Tester1",
		"trainer",
	)

	var profile models.Profile
	db.Model(&models.Profile{}).First(&profile)

	trainerID = profile.ID

	return db
}

func TeardownContactTests(db *gorm.DB) {
	sql := `
		delete from images;
		delete from pages;
		delete from profiles;
	`
	db.Exec(sql)
}

func TestPostContact(t *testing.T) {
	godotenv.Load("../.env")

	db := SetupContactTests()
	defer TeardownContactTests(db)

	mockEmailService := MockEmailService{}

	router := SetupRouter(db, &mockEmailService)

	w := httptest.NewRecorder()

	args := controllers.ContactArgs{
		Name:    "Tester",
		Email:   "test@example.com",
		Message: "This is a contact form message",
		Slug:    "/contact",
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

func TestPostContactTrainerPage(t *testing.T) {
	godotenv.Load("../.env")

	db := SetupContactTests()
	defer TeardownContactTests(db)

	mockEmailService := MockEmailService{}

	w := httptest.NewRecorder()

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into pages (profile_id, slug, active, blocks, title, description) values(?,?,?,?,?,?)",
		trainerID,
		"testpage1",
		true,
		blocks,
		"A page",
		"page description",
	)

	router := SetupRouter(db, &mockEmailService)

	args := controllers.ContactArgs{
		Name:    "Tester",
		Email:   "test@example.com",
		Message: "This is a contact form message",
		Slug:    "/testpage1",
	}

	marshalled, _ := json.Marshal(args)

	req, _ := http.NewRequest("POST", "/contact", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	expectedArgs := services.EmailArgs{
		To:      trainerEmail,
		Subject: "Contact Form",
		Body:    "Message: This is a contact form message\n\nName: Tester\n\nEmail: test@example.com",
	}

	assert.Equal(t, expectedArgs, mockEmailService.Args)
}
