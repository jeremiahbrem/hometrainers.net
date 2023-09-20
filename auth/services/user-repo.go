package services

import (
	"errors"
	"server/models"
	"time"

	"gorm.io/gorm"
)

type UserRepository struct {
	db    *gorm.DB
	clock ClockType
}

func CreateUserRepo(db *gorm.DB, clock ClockType) UserRepository {
	return UserRepository{db, clock}
}

func (repo *UserRepository) GetUser(email string) (*models.User, error) {
	var user *models.User
	if err := repo.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, err
	}

	if !user.Validated && user.CodeExpiration.Before(repo.clock.GetCurrentTime()) {
		repo.db.Delete(&user)
		return nil, errors.New("pending user expired")
	}
	return user, nil
}

func (repo *UserRepository) CreateUser(user models.User) {
	user.CodeExpiration = getExpiry(repo.clock)
	repo.db.Create(&user)
}

func (repo *UserRepository) ActivateUser(user *models.User) {
	user.Validated = true
	repo.db.Save(&user)
}

func (repo *UserRepository) UpdateCode(user *models.User) {
	user.CodeExpiration = getExpiry(repo.clock)
	repo.db.Save(&user)
}

func getExpiry(clock ClockType) time.Time {
	return clock.AddTime(clock.GetCurrentTime(), 24, 0, 0)
}
