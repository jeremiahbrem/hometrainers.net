package tests

import (
	"context"
	"main/services"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"google.golang.org/api/idtoken"
)

type MockGoogleValidator struct {
	claims map[string]interface{}
}

func (validator *MockGoogleValidator) Validate(ctx context.Context, idToken string, audience string) (*idtoken.Payload, error) {
	payload := idtoken.Payload{
		Claims: validator.claims,
	}

	return &payload, nil
}

type MockAuthValidator struct {
	response *http.Response
}

func (validator *MockAuthValidator) Validate(token string) (*http.Response, error) {
	return validator.response, nil
}

func TestValidateGoogle(t *testing.T) {
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	claims := map[string]interface{}{
		"email_verified": true,
		"email":          "test@example.com",
		"name":           "Tester",
	}

	mockGoogleValidator := MockGoogleValidator{
		claims: claims,
	}

	mockAuthValidator := MockAuthValidator{
		response: &http.Response{},
	}

	ctx.Request = &http.Request{
		Header: make(http.Header),
	}

	ctx.Request.Header.Set("Authorization", "Bearer test-token")
	ctx.Request.Header.Set("token-provider", "google")

	user, ok := services.GetAuthorizedUser(ctx, &mockAuthValidator, &mockGoogleValidator)

	expectedUser := services.User{
		Name:  "Tester",
		Email: "test@example.com",
	}

	assert.True(t, ok)
	assert.Equal(t, expectedUser, user)
}

func TestGoogleEmailUnverified(t *testing.T) {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	claims := map[string]interface{}{
		"email_verified": false,
		"email":          "test@example.com",
		"name":           "Tester",
	}

	mockGoogleValidator := MockGoogleValidator{
		claims: claims,
	}

	mockAuthValidator := MockAuthValidator{
		response: &http.Response{},
	}

	ctx.Request = &http.Request{
		Header: make(http.Header),
	}

	ctx.Request.Header.Set("Authorization", "Bearer test-token")
	ctx.Request.Header.Set("token-provider", "google")

	_, ok := services.GetAuthorizedUser(ctx, &mockAuthValidator, &mockGoogleValidator)

	assert.False(t, ok)
}

func TestGoogleNoAuthToken(t *testing.T) {
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	claims := map[string]interface{}{
		"email_verified": "false",
		"email":          "test@example.com",
		"name":           "Tester",
	}

	mockGoogleValidator := MockGoogleValidator{
		claims: claims,
	}

	mockAuthValidator := MockAuthValidator{
		response: &http.Response{},
	}

	ctx.Request = &http.Request{
		Header: make(http.Header),
	}

	ctx.Request.Header.Set("token-provider", "google")

	_, ok := services.GetAuthorizedUser(ctx, &mockAuthValidator, &mockGoogleValidator)

	assert.False(t, ok)
}

func TestGoogleNoProviderToken(t *testing.T) {
	ctx, _ := gin.CreateTestContext(httptest.NewRecorder())

	claims := map[string]interface{}{
		"email_verified": "false",
		"email":          "test@example.com",
		"name":           "Tester",
	}

	mockGoogleValidator := MockGoogleValidator{
		claims: claims,
	}

	mockAuthValidator := MockAuthValidator{
		response: &http.Response{},
	}

	ctx.Request = &http.Request{
		Header: make(http.Header),
	}

	ctx.Request.Header.Set("Authorization", "Bearer test-token")

	_, ok := services.GetAuthorizedUser(ctx, &mockAuthValidator, &mockGoogleValidator)

	assert.False(t, ok)
}
