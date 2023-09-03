package repositories

import (
	"server/models"

	"gorm.io/gorm"
)

type UserRepository struct {
	Db *gorm.DB
}

func (repo *UserRepository) GetUser(email string) (*models.User, error) {
	var user *models.User
	if err := repo.Db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}
	return user, nil
}
