package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
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

var trainerEmail = "trainer@example.com"
var trainerID uint

func SetupPagesTests() *gorm.DB {
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

func TeardownPagesTests(db *gorm.DB) {
	sql := `
		delete from pages;
		delete from profiles;
	`
	db.Exec(sql)
}

func TestGetActivePages(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into profiles (email, name, type) values(?,?,?)",
		"other@example.com",
		"Tester2",
		"trainer",
	)

	var otherProfile models.Profile
	db.Model(&models.Profile{}).Where(&models.Profile{Email: "other@example.com"}).First(&otherProfile)

	db.Exec(
		"insert into pages (profile_id, slug, active, blocks, title, description) values(?,?,?,?,?,?)",
		trainerID,
		"testpage1",
		true,
		blocks,
		"A page",
		"page description",
	)

	db.Exec(
		"insert into pages (profile_id, slug, active, blocks, title, description) values(?,?,?,?,?,?)",
		otherProfile.ID,
		"testpage2",
		false,
		blocks,
		"A page",
		"page description",
	)

	w := httptest.NewRecorder()

	router := SetupRouter(db)

	req, _ := http.NewRequest("GET", "/active-pages", nil)

	router.ServeHTTP(w, req)

	expected := `{"pages":["testpage1"]}`
	assert.Equal(t, expected, w.Body.String())
}

func TestGetPageBySlug(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

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

	w := httptest.NewRecorder()

	router := SetupRouter(db)

	req, _ := http.NewRequest("GET", "/page/testpage1", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		`"email":""`,
		`"slug":"testpage1"`,
		`"blocks":{"blocks":[{"header":"text"}]}`,
		`"active":true`,
		`"title":"A page"`,
		`"description":"page description"`,
	}

	for _, val := range expected {
		assert.Contains(t, w.Body.String(), val)
	}
}

func TestGetMyPage(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

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

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/my-page", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		fmt.Sprintf(`"email":"%s"`, trainerEmail),
		`"slug":"testpage1"`,
		`"blocks":{"blocks":[{"header":"text"}]}`,
		`"active":true`,
		`"title":"A page"`,
		`"description":"page description"`,
	}

	for _, val := range expected {
		assert.Contains(t, w.Body.String(), val)
	}
}

func TestGetMyPageNotFound(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/my-page", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		fmt.Sprintf(`"email":"%s"`, trainerEmail),
		`"slug":""`,
		`"blocks":{"blocks":[]}`,
		`"active":false`,
		`"title":""`,
		`"description":""`,
	}

	for _, val := range expected {
		assert.Contains(t, w.Body.String(), val)
	}
}

func TestGetMyPageNotTrainer(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	db.Exec(
		"insert into profiles (email, name, type) values(?,?,?)",
		"other@example.com",
		"Tester2",
		"client",
	)

	var otherProfile models.Profile
	db.Model(&models.Profile{}).Where(&models.Profile{Email: "other@example.com"}).First(&otherProfile)

	userValidator := MockUserValidator{
		User:  services.User{Email: "other@example.com"},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/my-page", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "trainer profile required")
}

type Block struct {
	BlockName string `json:"blockName" binding:"required"`
}

func TestCreatePageMissingField(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	page := models.PageArgs{
		Slug:        "test-page",
		Active:      true,
		Description: "descrip",
		Blocks:      datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "invalid page: Key: 'PageArgs.Title'")
}

func TestCreatePageSuccess(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	page := models.PageArgs{
		Slug:        "test-page",
		Title:       "Test Page",
		Active:      true,
		Description: "Descrip",
		Blocks:      datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var newPage *models.Page
	db.Where("slug = ?", page.Slug).First(&newPage)

	assert.True(t, newPage.Active)
	assert.Equal(t, newPage.Blocks, page.Blocks)
	assert.Equal(t, newPage.Title, page.Title)
	assert.Equal(t, newPage.Slug, page.Slug)
	assert.Equal(t, trainerID, newPage.ProfileID)
	assert.Equal(t, newPage.Description, page.Description)
}

func TestCreatePageSlugExists(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into profiles (email, name, type) values(?,?,?)",
		"other@example.com",
		"Tester2",
		"trainer",
	)

	var otherProfile models.Profile
	db.Model(&models.Profile{}).Where(&models.Profile{Email: "other@example.com"}).First(&otherProfile)

	db.Exec(
		"insert into pages (profile_id, slug, active, blocks, title, description) values(?,?,?,?,?,?)",
		otherProfile.ID,
		"testpage1",
		true,
		blocks,
		"A page",
		"descrip",
	)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	page := models.Page{
		Slug:        "testpage1",
		Title:       "Test Page",
		Description: "descrip",
		Active:      true,
		Blocks:      datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "slug testpage1 already exists")
}

func TestCreatePageSlugMyPage(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	page := models.Page{
		Slug:        "my-page",
		Title:       "Test Page",
		Description: "descrip",
		Active:      true,
		Blocks:      datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "slug my-page is reserved")
}

func TestUpdatePageSuccess(t *testing.T) {
	db := SetupPagesTests()
	defer TeardownPagesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	blocks := datatypes.JSON([]byte(`{"blocks": []}`))

	db.Exec(
		"insert into pages (profile_id, slug, active, blocks, title, description) values(?,?,?,?,?,?)",
		trainerID,
		"testpage1",
		true,
		blocks,
		"A page",
		"descrip",
	)

	page := models.Page{
		Slug:        "testpage1",
		Title:       "Test Page",
		Description: "descrip",
		Active:      true,
		Blocks:      datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var updatedPage *models.Page
	db.Where("slug = ?", page.Slug).First(&updatedPage)

	assert.Equal(t, updatedPage.Blocks, page.Blocks)
}
