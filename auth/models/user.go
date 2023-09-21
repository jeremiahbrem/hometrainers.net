package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email          string `gorm:"not null; uniqueIndex" json:"email" binding:"required"`
	Password       string `gorm:"not null" json:"password" binding:"required"`
	Name           string `gorm:"not null" json:"name" binding:"required"`
	Validated      bool   `gorm:"default:false"`
	ValidationCode string
	CodeExpiration time.Time
}
