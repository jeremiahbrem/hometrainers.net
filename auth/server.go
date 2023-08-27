package main

import (
	"context"
	"embed"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"server/database"
	dbModels "server/models"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-oauth2/oauth2/v4/generates"
	"github.com/golang-jwt/jwt"

	"github.com/go-oauth2/oauth2/v4/errors"
	"github.com/go-oauth2/oauth2/v4/manage"
	"github.com/go-oauth2/oauth2/v4/models"
	"github.com/go-oauth2/oauth2/v4/server"
	"github.com/go-oauth2/oauth2/v4/store"
)

var (
	idvar     string
	secretvar string
	domainvar string
	portvar   int
)

type SessionProvider func(context context.Context) SessionApiType

func init() {
	flag.StringVar(&idvar, "i", "222222", "The client id being passed in")
	flag.StringVar(&secretvar, "s", "22222222", "The client secret being passed in")
	flag.StringVar(&domainvar, "r", os.Getenv("NEXTAUTH_URL"), "The domain of the redirect url")
	flag.IntVar(&portvar, "p", 9096, "the base port for the server")
}

//go:embed static
var staticFiles embed.FS

func setupRouter(
	sessionProvider SessionProvider,
) *gin.Engine {
	flag.Parse()

	database.ConnectDb()

	router := gin.Default()

	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Authorization"}

	router.Use(cors.New(corsConfig))

	manager := manage.NewDefaultManager()
	manager.SetAuthorizeCodeTokenCfg(manage.DefaultAuthorizeCodeTokenCfg)

	manager.MustTokenStorage(store.NewMemoryTokenStore())

	manager.MapAccessGenerate(generates.NewJWTAccessGenerate("", []byte("00000000"), jwt.SigningMethodHS512))

	clientStore := store.NewClientStore()
	clientStore.Set(idvar, &models.Client{
		ID:     idvar,
		Secret: secretvar,
		Domain: domainvar,
	})

	manager.MapClientStorage(clientStore)

	srv := server.NewServer(server.NewConfig(), manager)

	srv.SetUserAuthorizationHandler(userAuthorizeHandler(sessionProvider))

	srv.SetInternalErrorHandler(func(err error) (re *errors.Response) {
		log.Println("Internal Error:", err.Error())
		return
	})

	srv.SetResponseErrorHandler(func(re *errors.Response) {
		log.Println("Response Error:", re.Error.Error())
	})

	router.POST("/login", loginHandler(sessionProvider))
	router.GET("/login", loginHandler(sessionProvider))
	router.GET("/auth", authHandler(sessionProvider))

	router.POST("/signup", func(ctx *gin.Context) {
		user := new(dbModels.User)
		if err := ctx.BindJSON(&user); err != nil {
			ctx.AbortWithError(http.StatusBadRequest, err)
			return
		}

		database.DB.Db.Create(&user)

		ctx.JSON(http.StatusOK, user)
	})

	router.GET("/get-user", func(ctx *gin.Context) {
		var user dbModels.User
		email := ctx.Request.URL.Query().Get("email")

		database.DB.Db.Where("name = ?", email).First(&user)

		ctx.JSON(http.StatusOK, user)
	})

	router.GET("/oauth/authorize", func(ctx *gin.Context) {
		session := sessionProvider(ctx)
		store, err := session.Start(ctx, ctx.Writer, ctx.Request)

		if err != nil {
			ctx.AbortWithError(http.StatusInternalServerError, err)
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
			ctx.AbortWithError(http.StatusBadRequest, err)
		}
	})

	router.POST("/oauth/token", func(context *gin.Context) {
		context.Request.ParseForm()

		err := srv.HandleTokenRequest(context.Writer, context.Request)
		if err != nil {
			context.AbortWithError(http.StatusInternalServerError, err)
			return
		}
	})

	router.GET("/validate", func(context *gin.Context) {
		token, err := srv.ValidationBearerToken(context.Request)

		if err != nil {
			context.AbortWithError(http.StatusBadRequest, err)
			return
		}

		context.JSON(http.StatusOK, gin.H{
			"expires_in": int64(time.Until(
				token.GetAccessCreateAt().Add(token.GetAccessExpiresIn()),
			).Seconds()),
			"client_id": token.GetClientID(),
			"user_id":   token.GetUserID(),
		})
	})

	router.GET("/user-info", func(context *gin.Context) {
		token, err := srv.ValidationBearerToken(context.Request)
		if err != nil {
			context.AbortWithError(http.StatusBadRequest, err)
			return
		}

		context.JSON(http.StatusOK, gin.H{
			"expires_in": int64(time.Until(token.GetAccessCreateAt().Add(token.GetAccessExpiresIn())).Seconds()),
			"client_id":  token.GetClientID(),
			"id":         token.GetUserID(),
			"name":       "guy",
			"email":      token.GetUserID(),
		})
	})

	return router
}

func main() {
	router := setupRouter(ProvideSessionApi)
	router.Run(fmt.Sprintf(":%d", portvar))
	log.Printf("Server is running at %d port.\n", portvar)
}

func userAuthorizeHandler(
	sessionProvider SessionProvider,
) func(w http.ResponseWriter, r *http.Request) (userID string, err error) {
	return func(w http.ResponseWriter, r *http.Request) (userID string, err error) {
		session := sessionProvider(r.Context())
		store, err := session.Start(r.Context(), w, r)

		if err != nil {
			return
		}

		uid, ok := store.Get("LoggedInUserID")

		if !ok {
			if r.Form == nil {
				r.ParseForm()
			}

			store.Set("ReturnUri", r.Form)
			store.Save()

			w.Header().Set("Location", "/login")
			w.WriteHeader(http.StatusFound)
			return
		}

		userID = uid.(string)

		store.Delete("LoggedInUserID")
		store.Save()
		return
	}
}

func loginHandler(
	sessionProvider SessionProvider,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		request := context.Request
		writer := context.Writer

		session := sessionProvider(context)
		store, err := session.Start(context, writer, request)

		if err != nil {
			context.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if request.Method == "POST" {
			if request.Form == nil {
				if err := request.ParseForm(); err != nil {
					context.AbortWithError(http.StatusInternalServerError, err)
					return
				}
			}

			store.Set("LoggedInUserID", request.Form.Get("username"))
			store.Save()

			context.Redirect(http.StatusFound, "/auth")
			return
		}

		outputHTML(context, "static/login.html")
	}
}

func authHandler(
	sessionProvider SessionProvider,
) gin.HandlerFunc {
	return func(context *gin.Context) {
		session := sessionProvider(context)

		store, err := session.Start(context, context.Writer, context.Request)
		if err != nil {
			context.AbortWithError(http.StatusInternalServerError, err)
			return
		}

		if _, ok := store.Get("LoggedInUserID"); !ok {
			context.Redirect(http.StatusFound, "/auth")
			return
		}

		context.Redirect(http.StatusFound, "/oauth/authorize")
	}
}

func outputHTML(context *gin.Context, filename string) {
	file, err := staticFiles.Open(filename)

	if err != nil {
		context.AbortWithError(http.StatusInternalServerError, err)
		return
	}

	defer file.Close()
	fi, _ := file.Stat()
	http.ServeContent(context.Writer, context.Request, filename, fi.ModTime(), file.(io.ReadSeeker))
}
