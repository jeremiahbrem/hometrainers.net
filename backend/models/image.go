package models

import (
	"gorm.io/gorm"
)

type Image struct {
	gorm.Model
	Path   string `gorm:"not null; uniqueIndex"`
	PageID uint
	Page   Page
}
