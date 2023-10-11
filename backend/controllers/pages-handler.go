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
	profile *models.Profile,
	slug string,
) bool {
	existingPage, exitingPageErr := pagesRepo.GetPage(slug)

	if exitingPageErr == nil && existingPage.ProfileID != profile.ID {
		slugExistsErr := fmt.Errorf("slug %s already exists", slug)
		context.JSON(http.StatusBadRequest, slugExistsErr.Error())
		return true
	}

	return false
}

type Slug struct {
	Slug string `uri:"slug" binding:"required"`
}

func resolvePage(page *models.Page, context *gin.Context, email string) {
	context.JSON(http.StatusOK, gin.H{
		"slug":        page.Slug,
		"email":       email,
		"title":       page.Title,
		"description": page.Description,
		"blocks":      page.Blocks,
		"active":      page.Active,
	})
}

func getPageBySlug(slug Slug, pagesRepo services.PageRepository, context *gin.Context) {
	var page *models.Page
	var pageErr error

	if page, pageErr = pagesRepo.GetPage(slug.Slug); pageErr != nil {
		context.JSON(http.StatusNotFound, gin.H{"error": "page not found"})
		return
	}

	resolvePage(page, context, "")
}

type EmptyBlocks struct {
	Blocks []string `json:"blocks" binding:"required"`
}

func getPageByEmail(email string, pagesRepo services.PageRepository, context *gin.Context) {
	var page *models.Page
	var pageErr error

	if page, pageErr = pagesRepo.GetUserPage(email); pageErr != nil {

		emptyBlocks := EmptyBlocks{Blocks: []string{}}

		context.JSON(http.StatusOK, gin.H{
			"slug":        "",
			"email":       email,
			"title":       "",
			"description": "",
			"blocks":      emptyBlocks,
			"active":      false,
		})
		return
	}

	resolvePage(page, context, email)
}

func CreatePagesHandlers(router *gin.Engine, provider services.ServiceProviderType) {
	pagesRepo := provider.GetPagesRepo()
	profilesRepo := provider.GetProfilesRepo()
	userValidator := provider.GetUserValidator()

	router.GET("/active-pages", func(context *gin.Context) {
		pagesRepo.GetActiveSlugs()
		var (
			pages []string
			err   error
		)

		if pages, err = pagesRepo.GetActiveSlugs(); err != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}

		context.JSON(http.StatusOK, gin.H{
			"pages": pages,
		})
	})

	router.GET("/page/:slug", func(context *gin.Context) {
		var slug Slug

		if err := context.ShouldBindUri(&slug); err != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		getPageBySlug(slug, pagesRepo, context)
	})

	router.POST("/my-page", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		profile, profileErr := profilesRepo.GetProfile(user.Email)

		if profileErr != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": "profile required"})
			return
		}

		if profile.Type != "trainer" {
			context.JSON(http.StatusBadRequest, gin.H{"error": "trainer profile required"})
			return
		}

		page := models.PageArgs{}

		parseErr := context.BindJSON(&page)

		if parseErr != nil {
			errMessage := fmt.Sprintf("invalid page: %s", parseErr)
			context.JSON(http.StatusBadRequest, gin.H{"error": errMessage})
			return
		}

		if page.Slug == "my-page" {
			context.JSON(http.StatusBadRequest, gin.H{"error": "slug my-page is reserved"})
			return
		}

		existing, existsErr := pagesRepo.GetUserPage(profile.Email)

		var dbErr error

		var message string

		if existsErr != nil {
			if exists := slugAlreadyExists(pagesRepo, context, profile, page.Slug); exists {
				return
			}

			dbErr = pagesRepo.CreatePage(page, profile)
			message = "created"

		} else {
			if exists := slugAlreadyExists(pagesRepo, context, profile, page.Slug); exists {
				return
			}

			dbErr = pagesRepo.UpdatePage(existing, page)
			message = "updated"
		}

		if dbErr != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": dbErr.Error()})
			return
		}

		context.JSON(http.StatusOK, fmt.Sprintf("Page %s", message))
	})

	router.GET("/my-page", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			context.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}

		profile, profileErr := profilesRepo.GetProfile(user.Email)

		if profileErr != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": "profile required"})
			return
		}

		if profile.Type != "trainer" {
			context.JSON(http.StatusBadRequest, gin.H{"error": "trainer profile required"})
			return
		}

		getPageByEmail(user.Email, pagesRepo, context)
	})
}
