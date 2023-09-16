package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Page struct {
	gorm.Model
	Email  string         `gorm:"uniqueIndex" json:"email" binding:"required"`
	Slug   string         `json:"slug" binding:"required"`
	Blocks datatypes.JSON `json:"blocks" binding:"required"`
	Active bool           `json:"active" binding:"required"`
}
