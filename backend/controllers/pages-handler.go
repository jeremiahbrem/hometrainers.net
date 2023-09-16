package controllers

import (
	"main/models"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func CreatePagesHandlers(router *gin.Engine, provider services.ServiceProviderType) {
	pagesRepo := provider.GetPagesRepo()

	router.GET("/active-pages", func(context *gin.Context) {
		pagesRepo.GetActiveSlugs()
		var (
			pages []string
			err   error
		)

		if pages, err = pagesRepo.GetActiveSlugs(); err != nil {
			context.AbortWithError(http.StatusInternalServerError, err)
		}

		context.JSON(http.StatusOK, gin.H{
			"pages": pages,
		})
	})

	type Slug struct {
		Slug string `uri:"slug" binding:"required"`
	}

	router.GET("/page/:slug", func(context *gin.Context) {
		var slug Slug
		var page *models.Page
		var pageErr error

		if err := context.ShouldBindUri(&slug); err != nil {
			context.AbortWithError(http.StatusBadRequest, err)
			return
		}

		if page, pageErr = pagesRepo.GetPage(slug.Slug); pageErr != nil {
			context.AbortWithError(http.StatusInternalServerError, pageErr)
		}

		context.JSON(http.StatusOK, page)
	})
}
