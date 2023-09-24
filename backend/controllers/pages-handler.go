package controllers

import (
	"fmt"
	"main/models"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

func slugAlreadyExists(
	pagesRepo services.PageRepository,
	context *gin.Context,
	page models.Page,
) bool {
	existingSlug, slugExistErr := pagesRepo.GetPage(page.Slug)

	if slugExistErr == nil && existingSlug.Email != page.Email {
		slugExistsErr := fmt.Errorf("slug %s already exists", page.Slug)
		context.JSON(http.StatusBadRequest, slugExistsErr.Error())
		return true
	}

	return false
}

func CreatePagesHandlers(router *gin.Engine, provider services.ServiceProviderType) {
	pagesRepo := provider.GetPagesRepo()
	userValidator := provider.GetUserValidator()

	router.GET("/active-pages", func(context *gin.Context) {
		pagesRepo.GetActiveSlugs()
		var (
			pages []string
			err   error
		)

		if pages, err = pagesRepo.GetActiveSlugs(); err != nil {
			context.JSON(http.StatusInternalServerError, err.Error())
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
			context.JSON(http.StatusBadRequest, err.Error())
			return
		}

		if page, pageErr = pagesRepo.GetPage(slug.Slug); pageErr != nil {
			context.JSON(http.StatusNotFound, "page not found")
		}

		context.JSON(http.StatusOK, page)
	})

	router.POST("/my-page", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		page := models.Page{}

		parseErr := context.BindJSON(&page)

		if parseErr != nil {
			errMessage := fmt.Sprintf("invalid page: %s", parseErr)
			context.JSON(http.StatusBadRequest, errMessage)
			return
		}

		if page.Email != user.Email {
			context.JSON(http.StatusUnauthorized, "unauthorized")
			return
		}

		existing, existsErr := pagesRepo.GetUserPage(page.Email)

		var dbErr error

		var message string

		if existsErr != nil {
			if exists := slugAlreadyExists(pagesRepo, context, page); exists {
				return
			}

			dbErr = pagesRepo.CreatePage(page)
			message = "created"

		} else {
			if exists := slugAlreadyExists(pagesRepo, context, page); exists {
				return
			}

			dbErr = pagesRepo.UpdatePage(existing, page)
			message = "updated"
		}

		if dbErr != nil {
			context.JSON(http.StatusInternalServerError, dbErr.Error())
			return
		}

		context.JSON(http.StatusOK, fmt.Sprintf("Page %s", message))
	})
}
