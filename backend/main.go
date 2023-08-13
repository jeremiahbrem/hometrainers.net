package main

import (
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
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

func getToken(context *gin.Context) (*oauth2.Token, error) {
	authHeader := context.Request.Header["Authorization"]
	token := strings.Split(authHeader[0], "Bearer ")[1]

	decoded, decodeErr := base64.StdEncoding.DecodeString(token)

	if decodeErr != nil {
		return nil, decodeErr
	}

	var contextToken *oauth2.Token

	jsondecodeErr := json.Unmarshal([]byte(decoded), &contextToken)

	if jsondecodeErr != nil {
		return nil, jsondecodeErr
	}

	return contextToken, nil
}

const (
	authServerURL = "http://localhost:9096"
)

var (
	config = oauth2.Config{
		ClientID:     "222222",
		ClientSecret: "22222222",
		Scopes:       []string{"all"},
		RedirectURL:  "http://localhost:3000/api/auth/callback/auth",
		Endpoint: oauth2.Endpoint{
			AuthURL:  authServerURL + "/oauth/authorize",
			TokenURL: authServerURL + "/oauth/token",
		},
	}
)

func main() {
	router := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Authorization"}

	router.Use(cors.New(corsConfig))

	router.GET("/", func(context *gin.Context) {
		context.JSON(200, gin.H{
			"status": "ok",
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
		state := context.Query("state")
		url := config.AuthCodeURL(state,
			oauth2.SetAuthURLParam("code_challenge", genCodeChallengeS256("s256example")),
			oauth2.SetAuthURLParam("code_challenge_method", "S256"))
		context.Redirect(http.StatusFound, url)
	})

	router.GET("/refresh", func(context *gin.Context) {
		contextToken, err := getToken(context)

		if err != nil {
			context.AbortWithError(http.StatusUnauthorized, err)
			return
		}

		contextToken.Expiry = time.Now()
		token, err := config.TokenSource(context, contextToken).Token()
		if err != nil {
			context.AbortWithError(http.StatusInternalServerError, err)
		}

		encoder := json.NewEncoder(context.Writer)
		encoder.SetIndent("", "  ")
		encoder.Encode(token)
	})

	router.GET("/try", func(context *gin.Context) {
		cachedToken, err := context.Cookie("auth-token")

		if err != nil {
			context.Redirect(http.StatusFound, "/")
			return
		}

		var contextToken *oauth2.Token

		decodeErr := json.Unmarshal([]byte(cachedToken), &contextToken)

		if decodeErr != nil {
			context.Redirect(http.StatusFound, "/")
			return
		}

		resp, err := http.Get(fmt.Sprintf("%s/test?access_token=%s", authServerURL, contextToken.AccessToken))

		if err != nil {
			context.AbortWithError(http.StatusBadRequest, err)
			return
		}
		defer resp.Body.Close()

		io.Copy(context.Writer, resp.Body)
	})

	router.Run(":8080")

	log.Println("Server is available at http://localhost:8080")
}

func genCodeChallengeS256(s string) string {
	s256 := sha256.Sum256([]byte(s))
	return base64.URLEncoding.EncodeToString(s256[:])
}
