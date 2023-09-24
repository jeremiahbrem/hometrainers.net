package tests

import (
	"main/services"

	"github.com/gin-gonic/gin"
)

type MockUserValidator struct {
	User  services.User
	Valid bool
}

func (validator *MockUserValidator) Validate(context *gin.Context) (services.User, bool) {
	return validator.User, validator.Valid
}
