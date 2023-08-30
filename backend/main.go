package main

import (
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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
	godotenv.Load(".env")

	authServerURL := os.Getenv("AUTH_SERVER_URL")

	router := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Authorization"}

	router.Use(cors.New(corsConfig))

	router.GET("/", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"status": "new",
		})
	})

	router.GET("/auth-check", func(context *gin.Context) {
		user, ok := getAuthorizedUser(context)

		if ok {
			context.JSON(200, gin.H{
				"user": user,
			})
		}
	})

	router.GET("/login", func(context *gin.Context) {
		oldUrl := context.Request.URL.String()
		params := strings.Split(oldUrl, "?")[1]
		newUrl := fmt.Sprintf("%s%s%s", authServerURL, "/oauth/authorize?", params)

		finalUrl, _ := url.Parse(newUrl)

		values := finalUrl.Query()

		values.Set("code_challenge", genCodeChallengeS256("s256example"))
		values.Set("code_challenge_method", "S256")

		finalUrl.RawQuery = values.Encode()

		context.Redirect(http.StatusFound, finalUrl.String())
	})

	// 	router.GET("/try", func(context *gin.Context) {
	// 		cachedToken, err := context.Cookie("auth-token")

	// 		if err != nil {
	// 			context.Redirect(http.StatusFound, "/")
	// 			return
	// 		}

	// 		var contextToken *oauth2.Token

	// 		decodeErr := json.Unmarshal([]byte(cachedToken), &contextToken)

	// 		if decodeErr != nil {
	// 			context.Redirect(http.StatusFound, "/")
	// 			return
	// 		}

	// 		resp, err := http.Get(fmt.Sprintf("%s/validate?access_token=%s", authServerURL, contextToken.AccessToken))

	// 		if err != nil {
	// 			context.AbortWithError(http.StatusBadRequest, err)
	// 		}

	// 		defer resp.Body.Close()

	// 		io.Copy(context.Writer, resp.Body)
	// 	})

	router.Run(":8080")

	log.Println("Server is available at http://localhost:8080")
}

func genCodeChallengeS256(s string) string {
	s256 := sha256.Sum256([]byte(s))
	return base64.URLEncoding.EncodeToString(s256[:])
}
