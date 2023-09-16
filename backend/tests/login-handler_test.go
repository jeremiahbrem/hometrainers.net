package tests

import (
	"main/controllers"
	"main/services"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestLoginRedirect(t *testing.T) {
	controllers.SetupRouter(&services.ServiceProvider{})

	w := httptest.NewRecorder()

	router := controllers.SetupRouter(&services.ServiceProvider{})

	req, _ := http.NewRequest("GET", "/login?state=abc123", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		"http://localhost:9096/oauth/authorize",
		"code_challenge=",
		"code_challenge_method=S256",
		"state=abc123",
	}
	for _, val := range expected {
		assert.Contains(t, w.Header().Get("Location"), val)
	}
}
