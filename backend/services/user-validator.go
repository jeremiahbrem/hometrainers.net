package services

import (
	"context"
	"encoding/json"
	"errors"
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
	Validate(ctx context.Context)
}

func GetAuthorizedUser(context *gin.Context) (User, bool) {
	providerHeader := context.Request.Header["token-provider"]
	provider := providerHeader[0]

	user := User{}
	valid := false

	if provider == "auth" {
		user, valid = getAuthUser(context, &AuthValidator{})
	}
	if provider == "google" {
		user, valid = getGoogleUser(context, &GoogleValidator{})
	}

	return user, valid
}

func getAuthUser(
	context *gin.Context,
	validator AuthValidatorType,
) (User, bool) {
	user := User{}

	token := getToken(context)

	resp, err := validator.Validate(token)

	if err != nil {
		context.AbortWithError(http.StatusBadRequest, err)
		return user, false
	}

	defer resp.Body.Close()

	body, bodyErr := ioutil.ReadAll(resp.Body)

	if bodyErr != nil {
		context.AbortWithError(http.StatusBadRequest, bodyErr)
		return user, false
	}

	jsonErr := json.Unmarshal(body, user)

	if jsonErr != nil {
		context.AbortWithError(http.StatusBadRequest, jsonErr)
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

	payload, err := validator.Validate(context, token, clientId)

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

func getToken(context *gin.Context) string {
	authHeader := context.Request.Header["Authorization"]
	token := strings.Split(authHeader[0], "Bearer ")[1]

	return token
}
