package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"main/controllers"
	"main/models"
	"main/services"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func Setup() *gorm.DB {
	godotenv.Load("../.env")

	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})

	db.AutoMigrate(&models.Page{})

	return db
}

func Teardown(db *gorm.DB) {
	sql := `
		delete from pages;
	`
	db.Exec(sql)
}

func SetupRouter(
	db *gorm.DB,
	args ...interface{},
) *gin.Engine {

	userValidator := &MockUserValidator{}

	if args != nil {
		for _, arg := range args {
			if v, ok := arg.(services.UserValidatorType); ok {
				userValidator = v.(*MockUserValidator)
			}
		}
	}

	serviceProvider := services.CreateProvider(
		db,
		&services.EmailService{},
		userValidator,
	)

	router := controllers.SetupRouter(serviceProvider)

	return router
}

func TestGetActivePages(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into pages (email, slug, active, blocks, city, title) values(?,?,?,?,?,?)",
		"test1@example.com",
		"testpage1",
		true,
		blocks,
		"Chicago",
		"A page",
	)

	db.Exec(
		"insert into pages (email, slug, active, blocks) values(?,?,?,?,?,?)",
		"test2@example.com",
		"testpage2",
		false,
		blocks,
		"New York City",
		"A page",
	)

	w := httptest.NewRecorder()

	router := SetupRouter(db)

	req, _ := http.NewRequest("GET", "/active-pages", nil)

	router.ServeHTTP(w, req)

	expected := `{"pages":["testpage1"]}`
	assert.Equal(t, expected, w.Body.String())
}

func TestGetPage(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into pages (email, slug, active, blocks, city, title) values(?,?,?,?,?,?)",
		"test1@example.com",
		"testpage1",
		true,
		blocks,
		"New York City",
		"A page",
	)

	w := httptest.NewRecorder()

	router := SetupRouter(db)

	req, _ := http.NewRequest("GET", "/page/testpage1", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		`"email":"test1@example.com"`,
		`"slug":"testpage1"`,
		`"blocks":{"blocks":[{"header":"text"}]}`,
		`"active":true`,
		`"city":"New York City`,
		`"title":"A page"`,
	}

	for _, val := range expected {
		assert.Contains(t, w.Body.String(), val)
	}
}

type Block struct {
	BlockName string `json:"blockName" binding:"required"`
}

func TestCreatePageMissingField(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: "test@example.com"},
		Valid: true,
	}

	page := models.Page{
		Email:  "test@example.com",
		Slug:   "test-page",
		Title:  "Test Page",
		Active: true,
		Blocks: datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "invalid page: Key: 'Page.City'")
}

func TestCreatePageUserNoMatch(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: "test@example.com"},
		Valid: true,
	}

	page := models.Page{
		Email:  "other@example.com",
		Slug:   "test-page",
		Title:  "Test Page",
		Active: true,
		Blocks: datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
		City:   "Chicago",
	}

	marshalled, _ := json.Marshal(page)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/my-page", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code)
	assert.Contains(t, w.Body.String(), "unauthorized")
}

func TestCreatePageSuccess(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: "test@example.com"},
		Valid: true,
	}

	page := models.Page{
		Email:  "test@example.com",
		Slug:   "test-page",
		Title:  "Test Page",
		Active: true,
		Blocks: datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
		City:   "Chicago",
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
	assert.Equal(t, newPage.City, page.City)
	assert.Equal(t, newPage.Blocks, page.Blocks)
	assert.Equal(t, newPage.Title, page.Title)
	assert.Equal(t, newPage.Slug, page.Slug)
	assert.Equal(t, newPage.Email, page.Email)
}

func TestCreatePageSlugExists(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into pages (email, slug, active, blocks, city, title) values(?,?,?,?,?,?)",
		"test1@example.com",
		"testpage1",
		true,
		blocks,
		"New York City",
		"A page",
	)

	userValidator := MockUserValidator{
		User:  services.User{Email: "test@example.com"},
		Valid: true,
	}

	page := models.Page{
		Email:  "test@example.com",
		Slug:   "testpage1",
		Title:  "Test Page",
		Active: true,
		Blocks: datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
		City:   "Chicago",
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
	db := Setup()
	defer Teardown(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: "test@example.com"},
		Valid: true,
	}

	page := models.Page{
		Email:  "test@example.com",
		Slug:   "my-page",
		Title:  "Test Page",
		Active: true,
		Blocks: datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
		City:   "Chicago",
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
	db := Setup()
	defer Teardown(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: "test1@example.com"},
		Valid: true,
	}

	blocks := datatypes.JSON([]byte(`{"blocks": []}`))

	db.Exec(
		"insert into pages (email, slug, active, blocks, city, title) values(?,?,?,?,?,?)",
		"test1@example.com",
		"testpage1",
		true,
		blocks,
		"New York City",
		"A page",
	)

	page := models.Page{
		Email:  "test1@example.com",
		Slug:   "testpage1",
		Title:  "Test Page",
		Active: true,
		Blocks: datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
		City:   "Chicago",
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
	fmt.Println(w.Body.String())
}
