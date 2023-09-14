package services

import (
	"server/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func CreateUserRepo(db *gorm.DB) UserRepository {
	return UserRepository{db}
}

func (repo *UserRepository) GetUser(email string) (*models.User, error) {
	var user *models.User
	if err := repo.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}

func (repo *UserRepository) CreateUser(user models.User) {
	repo.db.Create(&user)
}
