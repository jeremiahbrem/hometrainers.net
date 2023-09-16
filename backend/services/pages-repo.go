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
	var user *models.Page
	if err := repo.db.Where("slug = ?", slug).First(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (repo *PageRepository) GetActiveSlugs() ([]string, error) {
	var slugs []string

	err := repo.db.Model(&models.Page{}).Where("active = ?", true).Pluck("slug", &slugs).Error

	if err != nil {
		return nil, err
	}
	return slugs, nil
}

func (repo *PageRepository) CreatePage(page models.Page) {
	repo.db.Create(&page)
}
