package main

import (
	"fmt"
	"net/http"
	"server/models"
	"server/services"

	"github.com/gin-gonic/gin"
)

func CreateValidateEmailHandler(
	router *gin.Engine,
	provider services.ServiceProviderType,
) {
	router.POST("/validate-email", validateEmailPostHandler(provider))
	router.GET("/validate-email", validateEmailGetHandler(provider))
}

func validateEmailPostHandler(
	provider services.ServiceProviderType,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		email := context.Request.URL.Query().Get("email")
		userRepo := provider.GetUserRepo()
		codeGen := provider.GetCodeGenerator()
		emailService := provider.GetEmailService()

		var user *models.User
		var userErr error

		if email == "" {
			context.Redirect(http.StatusFound, "/signup")
			return
		}

		user, userErr = userRepo.GetUser(email)

		if userErr != nil {
			context.HTML(http.StatusBadRequest, "validate-email.tmpl", gin.H{
				"error": fmt.Sprintf("User %s not found", email),
			})
			return
		}

		code := codeGen.GenCode()

		user.ValidationCode = code
		userRepo.UpdateCode(user)

		emailService.SendVerificationLink(email, code)

		context.HTML(http.StatusAccepted, "validate-email.tmpl", gin.H{
			"message": "Code has been sent. Please check your email for a verification link to activate your account",
		})
	}
}

func validateEmailGetHandler(
	provider services.ServiceProviderType,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		userRepo := provider.GetUserRepo()
		var user *models.User
		var userErr error

		code := context.Request.URL.Query().Get("code")
		email := context.Request.URL.Query().Get("email")

		if email == "" {
			context.Redirect(http.StatusFound, "/signup")
			return
		}

		user, userErr = userRepo.GetUser(email)

		if userErr != nil {
			context.HTML(http.StatusBadRequest, "validate-email.tmpl", gin.H{
				"error": fmt.Sprintf("User %s not found", email),
				"email": email,
			})
			return
		}

		if code != "" {
			if code != user.ValidationCode {
				context.HTML(http.StatusBadRequest, "validate-email.tmpl", gin.H{
					"error":  "Invalid code",
					"resend": true,
					"email":  email,
				})
				return
			}

			userRepo.ActivateUser(user)

			context.HTML(http.StatusAccepted, "validate-email.tmpl", gin.H{
				"message": "Thank you for verifying your email. Your account is now active.",
				"email":   email,
			})
			return
		}

		context.HTML(http.StatusAccepted, "validate-email.tmpl", gin.H{
			"message": "Please check your email for a verification link to activate your account",
			"resend":  true,
			"email":   email,
		})
	}
}
