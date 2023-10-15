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
	To      string `json:"to" binding:"required"`
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
			To:      args.To,
			Body:    fmt.Sprintf("Message: %s\n\nName: %s\n\nEmail: %s", args.Message, args.Name, args.Email),
			Subject: "Contact Form",
		})

		context.JSON(http.StatusOK, "Email sent")
	})
}
