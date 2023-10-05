package controllers

import (
	"main/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func SetupRouter(
	serviceProvider services.ServiceProviderType,
) *gin.Engine {
	godotenv.Load("../.env")

	router := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Authorization", "token-provider"}

	router.Use(cors.New(corsConfig))

	CreateLoginHandler(router)
	CreatePagesHandlers(router, serviceProvider)
	CreateProfilesHandlers(router, serviceProvider)

	return router
}
