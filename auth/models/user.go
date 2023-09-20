package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email          string `gorm:"uniqueIndex" json:"email" binding:"required"`
	Password       string `json:"password" binding:"required"`
	Name           string `json:"name" binding:"required"`
	Validated      bool   `default:"false"`
	ValidationCode string
	CodeExpiration time.Time
}
