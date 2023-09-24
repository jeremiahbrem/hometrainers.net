package services

import (
	"fmt"
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
	if err := repo.db.Where("slug = ?", slug).First(&page).Error; err != nil {
		fmt.Println(err)
		return nil, err
	}
	return page, nil
}

func (repo *PageRepository) GetUserPage(email string) (*models.Page, error) {
	var page *models.Page
	if err := repo.db.Where("email = ?", email).First(&page).Error; err != nil {
		fmt.Println(err)
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

func (repo *PageRepository) CreatePage(page models.Page) error {
	return repo.db.Create(&page).Error
}

func (repo *PageRepository) UpdatePage(existing *models.Page, updated models.Page) error {
	existing.Active = updated.Active
	existing.Slug = updated.Slug
	existing.City = updated.City
	existing.Blocks = updated.Blocks
	existing.Active = updated.Active
	existing.Title = updated.Title

	return repo.db.Save(&existing).Error
}
