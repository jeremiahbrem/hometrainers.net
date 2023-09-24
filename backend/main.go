package main

import (
	"log"
	"main/controllers"
	"main/database"
	"main/services"

	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")

	database.ConnectDb()

	provider := services.CreateProvider(
		database.DB.Db,
		&services.EmailService{},
		&services.UserValidator{},
	)

	router := controllers.SetupRouter(provider)

	router.Run(":8080")

	log.Println("Server is available at http://localhost:8080")
}
