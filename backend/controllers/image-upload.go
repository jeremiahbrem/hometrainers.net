package controllers

import (
	"fmt"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

const MAX_UPLOAD_SIZE = 1024 * 1024 * 5

func CreateImageUploadHandler(router *gin.Engine, provider services.ServiceProviderType) {
	userValidator := provider.GetUserValidator()
	bucketService := provider.GetBucketService()

	router.POST("/image", func(context *gin.Context) {
		_, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		request := context.Request

		context.Request.Body = http.MaxBytesReader(context.Writer, request.Body, MAX_UPLOAD_SIZE)

		if err := request.ParseForm(); err != nil {
			context.JSON(http.StatusInternalServerError, err.Error())
			return
		}

		if err := request.ParseMultipartForm(MAX_UPLOAD_SIZE); err != nil {
			fmt.Println(err.Error())
			fileError := "The uploaded file is too big. Please choose a file that's less than 5MB in size"
			context.JSON(http.StatusBadRequest, gin.H{"error": fileError})
			return
		}

		file, _, err := request.FormFile("file")

		if err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": "There was a problem uploading the file"})
			return
		}

		defer file.Close()

		imagePath := request.Form.Get("image-path")

		bucketService.UploadImage(file, imagePath)

		context.JSON(http.StatusOK, "Image uploaded")
	})
}
