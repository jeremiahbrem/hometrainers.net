package services

import (
	"main/models"

	"gorm.io/gorm"
)

type PageRepository struct {
	db *gorm.DB
}

func CreatePageRepo(db *gorm.DB) PageRepository {
	return PageRepository{db}
}

func (repo *PageRepository) GetPage(slug string) (*models.Page, error) {
	var page *models.Page
	if err := repo.db.Where("slug = ?", slug).Where("active = ?", true).First(&page).Error; err != nil {
		return nil, err
	}
	return page, nil
}

func (repo *PageRepository) GetUserPage(email string) (*models.Page, error) {
	var page *models.Page
	db := repo.db
	where := db.Where(&models.Profile{Email: email})

	if err := db.Joins("Profile", where).First(&page).Error; err != nil {
		return nil, err
	}
	return page, nil
}

func (repo *PageRepository) GetTrainerPages(emails []string) map[string]*models.Page {
	var pages []*models.Page
	db := repo.db
	where := db.Where("email in ?", emails)

	db.Model(&models.Page{}).Where("active = ?", true).Joins("Profile", where).Find(&pages)

	pageMap := map[string]*models.Page{}

	for _, v := range pages {
		pageMap[v.Profile.Email] = v
	}

	return pageMap
}

func (repo *PageRepository) GetProfileSlugs(email string) (*models.Page, error) {
	var page *models.Page
	db := repo.db
	where := db.Where(&models.Profile{Email: email})

	if err := db.Joins("Profile", where).First(&page).Error; err != nil {
		return nil, err
	}
	return page, nil
}

func (repo *PageRepository) GetActiveSlugs() ([]string, error) {
	var slugs []string

	err := repo.db.Model(&models.Page{}).Where("active = ?", true).Pluck("slug", &slugs).Error

	if err != nil {
		return nil, err
	}
	return slugs, nil
}

func (repo *PageRepository) CreatePage(pageArgs models.PageArgs, profile *models.Profile) error {
	page := models.Page{
		ProfileID:   profile.ID,
		Slug:        pageArgs.Slug,
		Title:       pageArgs.Title,
		Description: pageArgs.Description,
		Blocks:      pageArgs.Blocks,
		Active:      false,
	}
	return repo.db.Create(&page).Error
}

func (repo *PageRepository) AddImage(imagePath string, email string) error {
	page, pageErr := repo.GetUserPage(email)

	if pageErr != nil {
		return pageErr
	}

	image := models.Image{
		PageID: page.ID,
		Path:   imagePath,
	}

	return repo.db.Create(&image).Error
}

func (repo *PageRepository) DeleteImage(imagePath string, email string) error {
	var image *models.Image
	db := repo.db
	db.Model(&models.Image{}).Where(&models.Image{Path: imagePath}).First(&image)
	return db.Delete(&image).Error
}

func (repo *PageRepository) GetImages(pageID uint) []string {
	var images []string
	repo.db.Model(&models.Image{}).Where(&models.Image{PageID: pageID}).Pluck("path", &images)

	return images
}

func (repo *PageRepository) UpdatePage(existing *models.Page, updated models.PageArgs) error {
	existing.Active = updated.Active
	existing.Slug = updated.Slug
	existing.Blocks = updated.Blocks
	existing.Active = updated.Active
	existing.Title = updated.Title
	existing.Description = updated.Description

	return repo.db.Save(&existing).Error
}
