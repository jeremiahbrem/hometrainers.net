package tests

import (
	"bytes"
	"image"
	"image/png"
	"io"
	"main/models"
	"main/services"
	"mime/multipart"
	"net/http/httptest"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TeardownImagesTests(db *gorm.DB) {
	sql := `
		delete from images;
		delete from pages;
		delete from profiles;
	`
	db.Exec(sql)
}

func TestImageUpload(t *testing.T) {
	godotenv.Load("../.env")

	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	db.AutoMigrate(&models.Page{}, &models.Image{})

	defer TeardownImagesTests(db)

	mockBucketService := MockBucketService{}

	email := "test@example.com"

	userValidator := MockUserValidator{
		User:  services.User{Email: email},
		Valid: true,
	}

	trainerProfile := models.Profile{
		Email:  email,
		Name:   "Tester",
		Type:   "trainer",
		Cities: []*models.City{},
		Goals:  []*models.Goal{},
		Image:  "image.com",
	}

	db.Create(&trainerProfile)

	page := models.Page{
		ProfileID:   trainerProfile.ID,
		Slug:        "testpage1",
		Title:       "Test Page",
		Description: "descrip",
		Active:      true,
		Blocks:      datatypes.JSON(`{"blocks":[{"blockName":"image-text-left","header":"text"}]}`),
	}

	db.Create(&page)

	router := SetupRouter(db, &userValidator, &mockBucketService)

	pr, pw := io.Pipe()
	form := multipart.NewWriter(pw)

	var img *image.RGBA

	go func() {
		defer pw.Close()

		form.WriteField("image-path", "abc123")

		img = CreateImage()

		w, _ := form.CreateFormFile("file", "image.png")

		png.Encode(w, img)

		form.Close()
	}()

	req := httptest.NewRequest("POST", "/image", pr)
	req.Header.Add("Content-Type", "multipart/form-data; boundary="+form.Boundary())

	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	reqFile, _, _ := req.FormFile("file")

	actual := bytes.NewBuffer(nil)
	io.Copy(actual, reqFile)

	expected := bytes.NewBuffer(nil)
	io.Copy(expected, mockBucketService.FileArg)

	assert.NotZero(t, expected.Len())
	assert.Equal(t, expected, actual)
	assert.Equal(t, mockBucketService.NameArg, "abc123")

	var dbImage *models.Image
	db.Where("path = ?", "abc123").First(&dbImage)

	assert.Equal(t, dbImage.Email, email)
}

func CreateImage() *image.RGBA {
	width := 200
	height := 100

	upLeft := image.Point{0, 0}
	lowRight := image.Point{width, height}

	img := image.NewRGBA(image.Rectangle{upLeft, lowRight})

	return img
}
