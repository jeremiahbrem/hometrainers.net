package tests

import (
	"bytes"
	"image"
	"image/png"
	"io"
	"main/services"
	"mime/multipart"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func TestImageUpload(t *testing.T) {
	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})

	mockBucketService := MockBucketService{}

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	router := SetupRouter(db, &userValidator, &mockBucketService)

	pr, pw := io.Pipe()
	form := multipart.NewWriter(pw)

	var img *image.RGBA

	go func() {
		defer pw.Close()

		form.WriteField("image-path", "/abc123")

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
	assert.Equal(t, mockBucketService.NameArg, "/abc123")
}

func CreateImage() *image.RGBA {
	width := 200
	height := 100

	upLeft := image.Point{0, 0}
	lowRight := image.Point{width, height}

	img := image.NewRGBA(image.Rectangle{upLeft, lowRight})

	return img
}
