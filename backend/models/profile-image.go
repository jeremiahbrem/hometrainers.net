package models

import (
	"gorm.io/gorm"
)

type ProfileImage struct {
	gorm.Model
	Path  string `gorm:"not null; uniqueIndex"`
	Email string
}
