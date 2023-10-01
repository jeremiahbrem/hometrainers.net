package main

import (
	"embed"
	"flag"
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"net/url"
	"server/database"
	"server/services"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

//go:embed static/*
var staticFiles embed.FS

//go:embed templates/*
var templateFiles embed.FS

func setupRouter(
	serviceProvider services.ServiceProviderType,
) *gin.Engine {
	flag.Parse()

	godotenv.Load(".env")

	router := gin.Default()

	templ := template.Must(template.New("").ParseFS(
		templateFiles, "templates/*.tmpl",
	))

	router.SetHTMLTemplate(templ)
	staticFS, _ := fs.Sub(staticFiles, "static")
	router.StaticFS("/static", http.FS(staticFS))

	router.StaticFile("/hpt-logo.svg", "./static/hpt-logo.svg")

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Authorization"}

	router.Use(cors.New(corsConfig))

	session := serviceProvider.GetSession()
	userRepo := serviceProvider.GetUserRepo()
	srv := serviceProvider.GetOauthServer()

	CreateLoginHandler(router, serviceProvider)
	CreateSignupHandler(router, serviceProvider)
	CreateValidateEmailHandler(router, serviceProvider)

	router.GET("/auth", authHandler(session))

	router.GET("/get-user", func(ctx *gin.Context) {
		email := ctx.Request.URL.Query().Get("email")

		user, err := userRepo.GetUser(email)

		if err != nil {
			ctx.JSON(http.StatusNotFound, fmt.Sprintf("User %s not found", email))
			return
		}

		ctx.JSON(http.StatusOK, gin.H{
			"name":  user.Name,
			"email": user.Email,
		})
	})

	router.GET("/oauth/authorize", func(ctx *gin.Context) {
		store, err := session.Start(ctx, ctx.Writer, ctx.Request)

		if err != nil {
			ctx.JSON(http.StatusInternalServerError, err)
			return
		}

		var form url.Values
		if v, ok := store.Get("ReturnUri"); ok {
			form = v.(url.Values)
		}

		ctx.Request.Form = form

		store.Delete("ReturnUri")
		store.Save()

		err = srv.HandleAuthorizeRequest(ctx.Writer, ctx.Request)

		if err != nil {
			ctx.JSON(http.StatusBadRequest, err)
		}
	})

	router.POST("/oauth/token", func(context *gin.Context) {
		context.Request.ParseForm()
		err := srv.HandleTokenRequest(context.Writer, context.Request)
		if err != nil {
			context.JSON(http.StatusInternalServerError, err.Error())
			return
		}
	})

	router.GET("/validate", func(context *gin.Context) {
		token, err := srv.ValidationBearerToken(context.Request)

		if err != nil {
			context.JSON(http.StatusBadRequest, err.Error())
			return
		}

		email := token.GetUserID()
		user, userErr := userRepo.GetUser(email)

		if userErr != nil {
			context.JSON(http.StatusBadRequest, userErr.Error())
			return
		}

		context.JSON(http.StatusOK, gin.H{
			"name":  user.Name,
			"email": email,
		})
	})

	router.GET("/user-info", func(context *gin.Context) {
		token, err := srv.ValidationBearerToken(context.Request)
		if err != nil {
			context.JSON(http.StatusBadRequest, err.Error())
			return
		}

		email := token.GetUserID()
		user, userErr := userRepo.GetUser(email)

		if userErr != nil {
			context.JSON(http.StatusBadRequest, userErr.Error())
			return
		}

		context.JSON(http.StatusOK, gin.H{
			"expires_in": int64(time.Until(token.GetAccessCreateAt().Add(token.GetAccessExpiresIn())).Seconds()),
			"client_id":  token.GetClientID(),
			"id":         email,
			"name":       user.Name,
			"email":      email,
		})
	})

	return router
}

func main() {
	database.ConnectDb()

	oauthServer := services.CreateOauthServer(&services.SessionApi{}, database.DSN)

	serviceProvider := services.CreateServiceProvider(
		&services.SessionApi{},
		database.DB.Db,
		oauthServer,
		&services.EmailService{},
		&services.CodeGenerator{},
		&services.Clock{},
	)

	router := setupRouter(&serviceProvider)
	router.Run(fmt.Sprintf(":%d", 9096))
	log.Printf("Server is running at %d port.\n", 9096)
}

func authHandler(
	session services.SessionApiType,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		store, err := session.Start(context, context.Writer, context.Request)
		if err != nil {
			context.JSON(http.StatusInternalServerError, err.Error())
			return
		}

		if _, ok := store.Get("LoggedInUserID"); !ok {
			context.Redirect(http.StatusFound, "/auth")
			return
		}

		context.Redirect(http.StatusFound, "/oauth/authorize")
	}
}
