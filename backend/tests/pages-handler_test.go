package tests

import (
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

func TestGetActivePages(t *testing.T) {
	db := Setup()
	defer Teardown(db)

	blocks := datatypes.JSON([]byte(`{"blocks": [{"header": "text"}]}`))

	db.Exec(
		"insert into pages (email, slug, active, blocks) values(?,?,?,?)",
		"test1@example.com",
		"testpage1",
		true,
		blocks,
	)

	db.Exec(
		"insert into pages (email, slug, active, blocks) values(?,?,?,?)",
		"test2@example.com",
		"testpage2",
		false,
		blocks,
	)

	w := httptest.NewRecorder()

	router := controllers.SetupRouter(services.CreateProvider(db))

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
		"insert into pages (email, slug, active, blocks) values(?,?,?,?)",
		"test1@example.com",
		"testpage1",
		true,
		blocks,
	)

	w := httptest.NewRecorder()

	router := controllers.SetupRouter(services.CreateProvider(db))

	req, _ := http.NewRequest("GET", "/page/testpage1", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		`"email":"test1@example.com"`,
		`"slug":"testpage1"`,
		`"blocks":{"blocks":[{"header":"text"}]}`,
		`"active":true`,
	}

	for _, val := range expected {
		assert.Contains(t, w.Body.String(), val)
	}
}
