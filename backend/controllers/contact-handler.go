package controllers

import (
	"fmt"
	"main/services"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

type ContactArgs struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required"`
	Message string `json:"message" binding:"required"`
	Slug    string `json:"slug" binding:"required"`
}

func CreateContactHandler(router *gin.Engine, provider services.ServiceProviderType) {
	emailService := provider.GetEmailService()
	pagesRepo := provider.GetPagesRepo()

	router.POST("/contact", func(context *gin.Context) {
		args := ContactArgs{}

		parseErr := context.BindJSON(&args)

		if parseErr != nil {
			errMessage := fmt.Sprintf("invalid fields: %s", parseErr)
			context.JSON(http.StatusBadRequest, gin.H{"error": errMessage})
			return
		}

		slug := strings.Replace(args.Slug, "/", "", -1)

		var to string

		if args.Slug == "/contact" {
			to = "support@hometrainers.net"
		} else {
			page, pageErr := pagesRepo.GetPage(slug)

			if pageErr != nil {
				context.JSON(http.StatusBadRequest, gin.H{"error": "Page not found"})
				return
			}
			to = page.Profile.Email
		}

		emailService.SendEmail(services.EmailArgs{
			To:      to,
			Body:    fmt.Sprintf("Message: %s\n\nName: %s\n\nEmail: %s", args.Message, args.Name, args.Email),
			Subject: "Contact Form",
		})

		context.JSON(http.StatusOK, "Email sent")
	})
}
