package controllers

import (
	"fmt"
	"io"
	"main/services"
	"mime/multipart"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/exp/slices"
)

const MAX_UPLOAD_SIZE = 1024 * 1024 * 5

func CreateImageUploadHandler(router *gin.Engine, provider services.ServiceProviderType) {
	userValidator := provider.GetUserValidator()
	bucketService := provider.GetBucketService()
	pagesRepo := provider.GetPagesRepo()
	profilesRepo := provider.GetProfilesRepo()

	router.POST("/image", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		imagePath, file, ok := GetImagePath(context)

		if !ok {
			return
		}

		pagesRepo.AddImage(imagePath, user.Email)

		bucketService.UploadImage(file, imagePath)

		context.JSON(http.StatusOK, "Image uploaded")
	})

	router.POST("/profile-image", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		imagePath, file, ok := GetImagePath(context)

		if !ok {
			return
		}

		profilesRepo.AddProfileImage(imagePath, user.Email)

		bucketService.UploadImage(file, imagePath)

		context.JSON(http.StatusOK, "Image uploaded")
	})
}

func GetImagePath(context *gin.Context) (string, multipart.File, bool) {
	request := context.Request

	var file multipart.File

	context.Request.Body = http.MaxBytesReader(context.Writer, request.Body, MAX_UPLOAD_SIZE)

	if err := request.ParseForm(); err != nil {
		context.JSON(http.StatusInternalServerError, err.Error())
		return "", file, false
	}

	if err := request.ParseMultipartForm(MAX_UPLOAD_SIZE); err != nil {
		fmt.Println(err.Error())
		fileError := "The uploaded file is too big. Please choose a file that's less than 5MB in size"
		context.JSON(http.StatusBadRequest, gin.H{"error": fileError})
		return "", file, false
	}

	file, _, err := request.FormFile("file")

	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "There was a problem uploading the file"})
		return "", file, false
	}

	buff := make([]byte, 512)
	_, err = file.Read(buff)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "There was a problem uploading the file"})
		return "", file, false
	}

	defer file.Close()

	filetype := http.DetectContentType(buff)
	fmt.Println(filetype)
	acceptedTypes := []string{"image/jpeg", "image/jpg", "image/png", "image/gif"}

	if !slices.Contains(acceptedTypes, filetype) {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "Accepted file types: jpeg, png, gif"})
		return "", file, false
	}

	_, err = file.Seek(0, io.SeekStart)
	if err != nil {
		context.JSON(http.StatusInternalServerError, gin.H{"error": "There was a problem uploading the file"})
		return "", file, false
	}

	imagePath := request.Form.Get("image-path")

	return imagePath, file, true
}
