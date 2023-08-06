package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

type User struct {
	Email string
	Name  string
}

func getAuthorizedUser(context *gin.Context) (User, bool) {
	user := User{}

	clientId := os.Getenv("GOOGLE_CLIENT_ID")

	authHeader := context.Request.Header["Authorization"]
	token := strings.Split(authHeader[0], "Bearer ")[1]

	payload, err := idtoken.Validate(context, token, clientId)

	if err != nil {
		context.AbortWithError(http.StatusUnauthorized, err)
		return user, false
	}

	emailVerified := fmt.Sprintf("%v", payload.Claims["email_verified"])

	if emailVerified != "true" {
		context.AbortWithError(http.StatusBadRequest, errors.New("email not verifed"))
		return user, false
	}

	user.Email = fmt.Sprintf("%v", payload.Claims["email"])
	user.Name = fmt.Sprintf("%v", payload.Claims["name"])

	return user, true
}

func main() {
	router := gin.Default()

	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowHeaders = []string{"Authorization"}

	router.Use(cors.New(config))

	router.GET("/", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"status": "ok",
		})
	})

	router.POST("/auth-check", func(context *gin.Context) {
		user, ok := getAuthorizedUser(context)

		if ok {
			context.JSON(200, gin.H{
				"user": user,
			})
		}
	})

	router.Run(":8080")

	log.Println("Server is available at http://localhost:8080")
}
