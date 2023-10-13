package controllers

import (
	"fmt"
	"main/models"
	"main/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

type TrainerResult struct {
	Name   string   `json:"name"`
	Slug   string   `json:"slug"`
	Image  string   ` json:"image"`
	Cities []string `json:"cities"`
	Goals  []string `json:"goals"`
}

type ProfileResult struct {
	Name   string   `json:"name"`
	Type   string   `json:"type"`
	Email  string   `json:"email"`
	Image  string   `json:"image"`
	Cities []string `json:"cities"`
	Goals  []string `json:"goals"`
}

func CreateProfilesHandlers(router *gin.Engine, provider services.ServiceProviderType) {
	pagesRepo := provider.GetPagesRepo()
	profilesRepo := provider.GetProfilesRepo()
	userValidator := provider.GetUserValidator()

	router.GET("/profile", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		profile, profileErr := profilesRepo.GetProfile(user.Email)

		if profileErr != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": "profile required"})
			return
		}

		cities, goals := GetAssociations(profile)

		profileResult := ProfileResult{
			Name:   profile.Name,
			Email:  profile.Email,
			Cities: cities,
			Goals:  goals,
			Type:   profile.Type,
			Image:  profile.Image,
		}

		context.JSON(http.StatusOK, profileResult)
	})

	router.GET("/matching-profiles", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		profile, profileErr := profilesRepo.GetProfile(user.Email)

		if profileErr != nil {
			context.JSON(http.StatusBadRequest, gin.H{"error": "profile required"})
			return
		}

		goals := make([]string, 0)
		for _, v := range profile.Goals {
			goals = append(goals, v.Name)
		}

		trainerProfiles := profilesRepo.GetMatchingProfiles(goals, profile.Cities[0].Name)

		profileEmails := make([]string, 0)

		for _, v := range trainerProfiles {
			profileEmails = append(profileEmails, v.Email)
		}

		pages := pagesRepo.GetTrainerPages(profileEmails)

		trainerResults := CreateTrainerResults(trainerProfiles, pages)

		context.JSON(http.StatusOK, trainerResults)
	})

	router.POST("/update-profile", func(context *gin.Context) {
		user, ok := userValidator.Validate(context)

		if !ok {
			return
		}

		profile := models.ProfileArgs{}

		parseErr := context.BindJSON(&profile)

		if parseErr != nil {
			errMessage := fmt.Sprintf("invalid profile: %s", parseErr)
			context.JSON(http.StatusBadRequest, gin.H{"error": errMessage})
			return
		}

		if len(profile.Cities) == 0 {
			context.JSON(http.StatusBadRequest, gin.H{"error": "City required"})
			return
		}

		if len(profile.Goals) == 0 {
			context.JSON(http.StatusBadRequest, gin.H{"error": "Goal required"})
			return
		}

		existing, existsErr := profilesRepo.GetProfile(user.Email)

		var dbErr error

		var message string

		if existsErr != nil {
			dbErr = profilesRepo.CreateProfile(profile, user.Email)
			message = "created"

		} else {
			dbErr = profilesRepo.UpdateProfile(existing, profile)
			message = "updated"
		}

		if dbErr != nil {
			context.JSON(http.StatusInternalServerError, gin.H{"error": dbErr.Error()})
			return
		}

		context.JSON(http.StatusOK, fmt.Sprintf("Profile %s", message))
	})
}

func CreateTrainerResults(profiles []*models.Profile, pages map[string]*models.Page) []TrainerResult {
	trainerResults := make([]TrainerResult, 0)

	for _, v := range profiles {
		cities, goals := GetAssociations(v)

		if page, ok := pages[v.Email]; ok {
			trainerResults = append(trainerResults, TrainerResult{
				Name:   v.Name,
				Image:  v.Image,
				Slug:   page.Slug,
				Cities: cities,
				Goals:  goals,
			})
		}
	}

	return trainerResults
}

func GetAssociations(profile *models.Profile) ([]string, []string) {
	cities := make([]string, 0)
	goals := make([]string, 0)

	for _, c := range profile.Cities {
		cities = append(cities, c.Name)
	}

	for _, g := range profile.Goals {
		goals = append(goals, g.Name)
	}

	return cities, goals
}
