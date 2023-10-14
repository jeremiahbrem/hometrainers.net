package controllers

import (
	"fmt"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreateContactHandler(router *gin.Engine, provider services.ServiceProviderType) {
	emailService := provider.GetEmailService()

	router.POST("/contact", func(context *gin.Context) {
		request := context.Request

		if request.Form == nil {
			if err := request.ParseForm(); err != nil {
				context.JSON(http.StatusInternalServerError, err.Error())
				return
			}
		}

		name := request.Form.Get("name")
		email := request.Form.Get("email")
		message := request.Form.Get("message")

		emailService.SendEmail(services.EmailArgs{
			To:      "support@hometrainers.net",
			Body:    fmt.Sprintf("%s\nSent from %s %s", message, name, email),
			Subject: "Contact Form",
		})

		context.JSON(http.StatusOK, "Email sent")
	})
}
