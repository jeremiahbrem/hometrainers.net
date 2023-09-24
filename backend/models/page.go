package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Page struct {
	gorm.Model
	Email  string         `gorm:"not null; uniqueIndex" json:"email" binding:"required"`
	Slug   string         `gorm:"not null' uniqueIndex" json:"slug" binding:"required"`
	Blocks datatypes.JSON `json:"blocks" binding:"required"`
	Active bool           `json:"active" binding:"required" gorm:"default:true"`
	City   string         `json:"city" binding:"required" gorm:"not null"`
	Title  string         `json:"title" binding:"required" gorm:"not null"`
}
