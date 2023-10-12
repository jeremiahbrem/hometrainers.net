package tests

import (
	"main/controllers"
	"main/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupRouter(
	db *gorm.DB,
	args ...interface{},
) *gin.Engine {

	userValidator := &MockUserValidator{}
	bucketService := &MockBucketService{}

	if args != nil {
		for _, arg := range args {
			if v, ok := arg.(services.UserValidatorType); ok {
				userValidator = v.(*MockUserValidator)
			}
			if v, ok := arg.(services.BucketServiceType); ok {
				bucketService = v.(*MockBucketService)
			}
		}
	}

	serviceProvider := services.CreateProvider(
		db,
		&MockEmailService{},
		userValidator,
		bucketService,
	)

	router := controllers.SetupRouter(serviceProvider)

	return router
}
