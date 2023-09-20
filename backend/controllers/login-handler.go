package controllers

import (
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

func CreateLoginHandler(router *gin.Engine) {
	router.GET("/login", func(context *gin.Context) {
		authServerURL := os.Getenv("AUTH_SERVER_URL")

		oldUrl := context.Request.URL.String()
		params := strings.Split(oldUrl, "?")[1]
		newUrl := fmt.Sprintf("%s%s%s", authServerURL, "/oauth/authorize?", params)

		finalUrl, _ := url.Parse(newUrl)

		values := finalUrl.Query()

		values.Set("code_challenge", genCodeChallengeS256())
		values.Set("code_challenge_method", "S256")

		finalUrl.RawQuery = values.Encode()

		context.Redirect(http.StatusFound, finalUrl.String())
	})
}

func genCodeChallengeS256() string {
	s256 := sha256.Sum256([]byte(fmt.Sprint(rand.Int())))
	return base64.URLEncoding.EncodeToString(s256[:])
}
