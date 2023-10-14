package controllers

import (
	"fmt"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type ContactArgs struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required"`
	Message string `json:"message" binding:"required"`
}

func CreateContactHandler(router *gin.Engine, provider services.ServiceProviderType) {
	emailService := provider.GetEmailService()

	router.POST("/contact", func(context *gin.Context) {
		args := ContactArgs{}

		parseErr := context.BindJSON(&args)

		if parseErr != nil {
			errMessage := fmt.Sprintf("invalid fields: %s", parseErr)
			context.JSON(http.StatusBadRequest, gin.H{"error": errMessage})
			return
		}

		emailService.SendEmail(services.EmailArgs{
			To:      "support@hometrainers.net",
			Body:    fmt.Sprintf("%s\nSent from %s %s", args.Message, args.Name, args.Email),
			Subject: "Contact Form",
		})

		context.JSON(http.StatusOK, "Email sent")
	})
}
