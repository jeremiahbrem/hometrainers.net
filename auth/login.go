package main

import (
	"net/http"
	"server/services"
	"server/users"

	"github.com/gin-gonic/gin"
)

func CreateLoginHandler(
	router *gin.Engine,
	provider services.ServiceProviderType,
) {
	router.POST("/login", loginHandler(provider))
	router.GET("/login", loginHandler(provider))
}

func loginHandler(
	provider services.ServiceProviderType,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		request := context.Request
		writer := context.Writer

		session := provider.GetSession()
		userRepo := provider.GetUserRepo()

		store, err := session.Start(context, writer, request)

		if err != nil {
			context.JSON(http.StatusInternalServerError, err.Error())
			return
		}

		if request.Method == "POST" {
			if request.Form == nil {
				if err := request.ParseForm(); err != nil {
					context.JSON(http.StatusInternalServerError, err.Error())
					return
				}
			}

			email := request.Form.Get("email")
			password := request.Form.Get("password")

			user, _ := userRepo.GetUser(email)

			if user == nil {
				context.HTML(http.StatusBadRequest, "login.tmpl", gin.H{
					"error":    "User not found",
					"email":    email,
					"password": password,
				})
				return
			}

			if !user.Validated {
				context.HTML(http.StatusBadRequest, "login.tmpl", gin.H{
					"error":    "Email verification required. Please check your email for a verification link.",
					"email":    email,
					"password": password,
				})
				return
			}

			if !users.CheckPasswordHash(password, user.Password) {
				context.HTML(http.StatusBadRequest, "login.tmpl", gin.H{
					"error":    "Incorrect password",
					"email":    email,
					"password": password,
				})
				return
			}

			store.Set("LoggedInUserID", email)
			store.Save()

			context.Redirect(http.StatusFound, "/auth")
			return
		}

		context.HTML(http.StatusOK, "login.tmpl", gin.H{
			"error":    nil,
			"email":    nil,
			"password": nil,
		})
	}
}
