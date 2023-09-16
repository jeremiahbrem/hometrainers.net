package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net"
	"os"
	"server/models"
	"server/services"
	"server/users"

	"cloud.google.com/go/cloudsqlconn"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/stdlib"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Dbinstance struct {
	Db *gorm.DB
}

var DB Dbinstance
var DSN string

func exitWithError(err error) {
	log.Fatal("Failed to connect to database. \n", err)
	os.Exit(1)
}

func initializeDb(db *gorm.DB, dbErr error) {
	if dbErr != nil {
		exitWithError(dbErr)
	}

	log.Println("connected")
	db.Logger = logger.Default.LogMode(logger.Info)

	log.Println("running migrations")
	db.AutoMigrate(&models.User{})

	DB = Dbinstance{
		Db: db,
	}
}

func loadTestUser() {
	userRepo := services.CreateUserRepo(DB.Db)
	if _, err := userRepo.GetUser("test@example.com"); err != nil {
		pwd, _ := users.HashPassword("test-password")

		user := models.User{
			Name:     "Test User",
			Email:    "test@example.com",
			Password: pwd,
		}

		userRepo.CreateUser(user)
	}
}

func connectDevDB() {
	dsn := fmt.Sprintf(
		"host=%s user=%s database=%s password=%s",
		os.Getenv("POSTGRES_HOST"),
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PASSWORD"),
	)

	db, dbErr := gorm.Open(postgres.New(postgres.Config{
		DSN: dsn,
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	initializeDb(db, dbErr)

	DSN = dsn

	loadTestUser()
}

func ConnectDb() {
	godotenv.Load(".env")

	if os.Getenv("ENVIRONMENT") != "PROD" {
		connectDevDB()
		return
	}

	dsn := fmt.Sprintf(
		"user=%s database=%s password=%s",
		os.Getenv("POSTGRES_USER"),
		os.Getenv("POSTGRES_DB"),
		os.Getenv("POSTGRES_PASSWORD"),
	)

	config, parseErr := pgx.ParseConfig(dsn)
	if parseErr != nil {
		exitWithError(parseErr)
	}

	dialer, dialerErr := cloudsqlconn.NewDialer(context.Background())
	if dialerErr != nil {
		exitWithError(dialerErr)
	}

	config.DialFunc = func(ctx context.Context, network, instance string) (net.Conn, error) {
		return dialer.Dial(ctx, os.Getenv("POSTGRES_HOST"))
	}

	dbURI := stdlib.RegisterConnConfig(config)

	sqlDB, err := sql.Open("pgx", dbURI)

	if err != nil {
		exitWithError(err)
	}

	db, dbErr := gorm.Open(postgres.New(postgres.Config{
		Conn: sqlDB,
	}), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	initializeDb(db, dbErr)

	DSN = dsn
}
