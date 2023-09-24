package main

import (
	"fmt"
	"net/http"
	"server/models"
	"server/services"
	"server/users"

	"github.com/gin-gonic/gin"
)

func CreateSignupHandler(
	router *gin.Engine,
	provider services.ServiceProviderType,
) {
	router.POST("/signup", signUpHandler(provider))
	router.GET("/signup", signUpHandler(provider))
}

func signUpHandler(
	provider services.ServiceProviderType,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		userRepo := provider.GetUserRepo()
		emailService := provider.GetEmailService()
		codeGenerator := provider.GetCodeGenerator()

		request := context.Request

		if request.Method == "POST" {
			if request.Form == nil {
				if err := request.ParseForm(); err != nil {
					context.JSON(http.StatusInternalServerError, err)
					return
				}
			}

			email := request.Form.Get("email")
			password := request.Form.Get("password")
			name := request.Form.Get("name")

			user, _ := userRepo.GetUser(email)

			if user != nil {
				context.HTML(http.StatusBadRequest, "signup.tmpl", gin.H{
					"error":    fmt.Sprintf("Email %s already exists", email),
					"email":    email,
					"password": password,
					"name":     name,
				})
				return
			}

			values := map[string]string{
				"name":     name,
				"email":    email,
				"password": password,
			}

			for field, val := range values {
				if val == "" {
					context.HTML(http.StatusBadRequest, "signup.tmpl", gin.H{
						"error":    fmt.Sprintf("Invalid field: %s", field),
						"email":    email,
						"password": password,
						"name":     name,
					})
					return
				}
			}

			if len(password) < 8 {
				context.HTML(http.StatusBadRequest, "signup.tmpl", gin.H{
					"error":    "Password must be a minimum of 8 characters",
					"email":    email,
					"password": password,
					"name":     name,
				})
				return
			}

			code := codeGenerator.GenCode()
			hash, pwdErr := users.HashPassword(password)

			if pwdErr != nil {
				context.HTML(http.StatusInternalServerError, "signup.tmpl", gin.H{
					"error":    "There was an error creating new user",
					"email":    email,
					"password": password,
					"name":     name,
				})
				return
			}

			newUser := models.User{
				Name:           name,
				Email:          email,
				Password:       hash,
				ValidationCode: code,
			}

			userRepo.CreateUser(newUser)

			emailService.SendVerificationLink(email, code)

			redirectUrl := fmt.Sprintf("/validate-email?email=%s", email)

			context.Redirect(http.StatusFound, redirectUrl)
			return
		}

		context.HTML(http.StatusOK, "signup.tmpl", gin.H{
			"error":    nil,
			"email":    nil,
			"password": nil,
			"name":     nil,
		})
	}
}
