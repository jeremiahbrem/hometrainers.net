package services

import (
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"google.golang.org/api/idtoken"
)

type User struct {
	Email string `json:"email" binding:"required"`
	Name  string `json:"name" binding:"required"`
}

type GoogleValidatorType interface {
	Validate(ctx context.Context, idToken string, audience string) (*idtoken.Payload, error)
}

type GoogleValidator struct{}

func (validator *GoogleValidator) Validate(
	ctx context.Context,
	idToken string,
	audience string,
) (*idtoken.Payload, error) {
	return idtoken.Validate(ctx, idToken, audience)
}

type AuthValidatorType interface {
	Validate(token string) (*http.Response, error)
}

type AuthValidator struct{}

func (validator *AuthValidator) Validate(token string) (*http.Response, error) {
	authServerURL := os.Getenv("AUTH_SERVER_URL")
	resp, err := http.Get(fmt.Sprintf("%s/validate?access_token=%s", authServerURL, token))
	return resp, err
}

type UserValidatorType interface {
	Validate(context *gin.Context) (User, bool)
}

type UserValidator struct{}

func (validator *UserValidator) Validate(context *gin.Context) (User, bool) {
	return GetAuthorizedUser(context, &AuthValidator{}, &GoogleValidator{})
}

func GetAuthorizedUser(
	context *gin.Context,
	authVal AuthValidatorType,
	googleVal GoogleValidatorType,
) (User, bool) {
	providerHeader := context.Request.Header["Token-Provider"]

	user := User{}
	valid := false

	if len(providerHeader) == 0 {
		context.JSON(http.StatusBadRequest, gin.H{"error": "invalid token provider header"})
		return user, false
	}

	if providerHeader[0] != "auth" && providerHeader[0] != "google" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "invalid token provider header"})
		return user, false
	}

	provider := providerHeader[0]

	if provider == "auth" {
		user, valid = getAuthUser(context, authVal)
	}
	if provider == "google" {
		user, valid = getGoogleUser(context, googleVal)
	}

	return user, valid
}

func invalidAuth(context *gin.Context, user User) (User, bool) {
	context.JSON(http.StatusBadRequest, gin.H{"error": "invalid authorization header"})
	return user, false
}

func getAuthUser(
	context *gin.Context,
	validator AuthValidatorType,
) (User, bool) {
	user := User{}

	token := getToken(context)

	if token == "" {
		return invalidAuth(context, user)
	}

	resp, err := validator.Validate(token)

	if err != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return user, false
	}

	defer resp.Body.Close()

	body, bodyErr := ioutil.ReadAll(resp.Body)

	if bodyErr != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": bodyErr.Error()})
		return user, false
	}

	jsonErr := json.Unmarshal(body, &user)

	if jsonErr != nil {
		context.JSON(http.StatusBadRequest, gin.H{"error": jsonErr.Error()})
		return user, false
	}

	return user, true
}

func getGoogleUser(
	context *gin.Context,
	validator GoogleValidatorType,
) (User, bool) {
	user := User{}

	clientId := os.Getenv("GOOGLE_CLIENT_ID")

	token := getToken(context)

	if token == "" {
		return invalidAuth(context, user)
	}

	payload, err := validator.Validate(context, token, clientId)

	if err != nil {
		context.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return user, false
	}

	emailVerified := fmt.Sprintf("%v", payload.Claims["email_verified"])

	if emailVerified != "true" {
		context.JSON(http.StatusBadRequest, gin.H{"error": "email not verifed"})
		return user, false
	}

	user.Email = fmt.Sprintf("%v", payload.Claims["email"])
	user.Name = fmt.Sprintf("%v", payload.Claims["name"])

	return user, true
}

func getToken(context *gin.Context) string {
	authHeader := context.Request.Header["Authorization"]

	if len(authHeader) == 0 {
		return ""
	}

	if authHeader[0] == "" {
		return ""

	}

	split := strings.Split(authHeader[0], "Bearer ")

	if len(split) != 2 {
		return ""
	}

	token := split[1]

	return token
}
