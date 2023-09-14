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
	session := provider.GetSession()
	userRepo := provider.GetUserRepo()

	router.POST("/login", loginHandler(session, userRepo))
	router.GET("/login", loginHandler(session, userRepo))
}

func loginHandler(
	session services.SessionApiType,
	userRepo services.UserRepository,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		request := context.Request
		writer := context.Writer

		store, err := session.Start(context, writer, request)

		if err != nil {
			context.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if request.Method == "POST" {
			if request.Form == nil {
				if err := request.ParseForm(); err != nil {
					context.AbortWithError(http.StatusInternalServerError, err)
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
