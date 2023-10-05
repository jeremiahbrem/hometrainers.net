package services

import (
	"main/models"
	"sort"

	"golang.org/x/exp/slices"
	"gorm.io/gorm"
)

type ProfileRepository struct {
	db *gorm.DB
}

func CreateProfilesRepo(db *gorm.DB) ProfileRepository {
	return ProfileRepository{db}
}

func (repo *ProfileRepository) CreateProfile(args models.ProfileArgs, email string) error {
	dbCities := GetCityAssociations(repo.db, args.Cities)
	dbGoals := GetGoalAssociations(repo.db, args.Goals)

	profile := models.Profile{
		Email:  email,
		Name:   args.Name,
		Type:   args.Type,
		Image:  args.Image,
		Cities: dbCities,
		Goals:  dbGoals,
	}

	return repo.db.Create(&profile).Error
}

func (repo *ProfileRepository) UpdateProfile(profile *models.Profile, args models.ProfileArgs) error {
	dbCities := GetCityAssociations(repo.db, args.Cities)
	dbGoals := GetGoalAssociations(repo.db, args.Goals)

	repo.db.Model(&profile).Association("Cities").Replace(dbCities)
	repo.db.Model(&profile).Association("Goals").Replace(dbGoals)
	profile.Image = args.Image
	profile.Name = args.Name

	return repo.db.Save(&profile).Error
}

func (repo *ProfileRepository) GetProfile(email string) (*models.Profile, error) {
	var profile *models.Profile
	if err := repo.db.Where("email = ?", email).Preload("Cities").Preload("Goals").First(&profile).Error; err != nil {
		return nil, err
	}
	return profile, nil
}

func (repo *ProfileRepository) GetMatchingProfiles(goals []string, city string) []*models.Profile {
	db := repo.db

	cityProfiles := GetCityProfiles(db, city)

	profileEmails := GetProfileEmails(cityProfiles)

	goalProfiles := GetGoalProfiles(db, profileEmails, goals)

	countMap := CreateCountMap(goalProfiles)

	SortProfiles(goalProfiles, countMap)

	uniqueProfiles := GetUniqueProfiles(goalProfiles)

	return uniqueProfiles
}

func GetCityAssociations(db *gorm.DB, cities []string) []*models.City {
	return GetAssociations(
		db,
		cities,
		func(name string) *models.City { return &models.City{Name: name} },
		func(m *models.City) string { return m.Name },
	)
}

func GetGoalAssociations(db *gorm.DB, goals []string) []*models.Goal {
	return GetAssociations(
		db,
		goals,
		func(name string) *models.Goal { return &models.Goal{Name: name} },
		func(m *models.Goal) string { return m.Name },
	)
}

func GetAssociations[model *models.City | *models.Goal](
	db *gorm.DB,
	items []string,
	getModel func(name string) model,
	getName func(m model) string,
) []model {
	dbItems := make([]model, 0)

	db.Where("name in ?", items).Find(&dbItems)

	existingNames := make([]string, 0)

	for _, v := range dbItems {
		existingNames = append(existingNames, getName(v))
	}

	for _, v := range items {
		if !slices.Contains(existingNames, v) {
			newItem := getModel(v)
			db.Create(&newItem)

			dbItems = append(dbItems, newItem)
		}
	}

	return dbItems
}

func GetGoalProfiles(db *gorm.DB, cityProfileEmails []string, goals []string) []*models.Profile {
	goalProfiles := make([]*models.Profile, 0)

	var goalResult []models.Goal

	db.Model(&models.Goal{}).Where("name in ?", goals).Preload("Profiles", "type = ? and email in ?", "trainer", cityProfileEmails).Preload("Profiles.Cities").Preload("Profiles.Goals").Find(&goalResult)

	for _, v := range goalResult {
		goalProfiles = append(goalProfiles, v.Profiles...)
	}

	return goalProfiles
}

func GetCityProfiles(db *gorm.DB, city string) []*models.Profile {
	cityProfiles := make([]*models.Profile, 0)

	var cityResult []models.City
	db.Model(&models.City{}).Where("name = ?", city).Preload("Profiles", "type = ?", "trainer").Find(&cityResult)

	for _, v := range cityResult {
		cityProfiles = append(cityProfiles, v.Profiles...)
	}

	return cityProfiles
}

func GetProfileEmails(profiles []*models.Profile) []string {
	profileEmails := make([]string, 0)

	for _, v := range profiles {
		profileEmails = append(profileEmails, v.Email)
	}

	return profileEmails
}

func CreateCountMap(profiles []*models.Profile) map[string]int {
	countMap := map[string]int{}

	for _, v := range profiles {
		if _, ok := countMap[v.Email]; ok {
			countMap[v.Email] += 1
		} else {
			countMap[v.Email] = 1
		}
	}

	return countMap
}

func SortProfiles(profiles []*models.Profile, countMap map[string]int) {
	sort.SliceStable(profiles, func(i, j int) bool {
		return countMap[profiles[i].Email] > countMap[profiles[j].Email]
	})
}

func GetUniqueProfiles(profiles []*models.Profile) []*models.Profile {
	uniqueMap := map[string]int{}
	uniqueProfiles := make([]*models.Profile, 0)

	for _, v := range profiles {
		if _, ok := uniqueMap[v.Email]; !ok {
			uniqueMap[v.Email] = 1
			uniqueProfiles = append(uniqueProfiles, v)
		}
	}

	return uniqueProfiles
}
