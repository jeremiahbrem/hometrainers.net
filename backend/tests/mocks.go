package tests

import (
	"main/services"
	"mime/multipart"

	"github.com/gin-gonic/gin"
)

type MockUserValidator struct {
	User  services.User
	Valid bool
}

func (validator *MockUserValidator) Validate(context *gin.Context) (services.User, bool) {
	return validator.User, validator.Valid
}

type MockEmailService struct {
	Args services.EmailArgs
}

func (emailService *MockEmailService) SendEmail(args services.EmailArgs) error {
	emailService.Args = args
	return nil
}

type MockBucketService struct {
	FileArg multipart.File
	NameArg string
}

func (bucketService *MockBucketService) UploadImage(file multipart.File, name string) error {
	bucketService.FileArg = file
	bucketService.NameArg = name
	return nil
}
func (bucketService *MockBucketService) DeleteImage(name string) {
	bucketService.NameArg = name
}
