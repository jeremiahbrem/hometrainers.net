package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type Page struct {
	gorm.Model
	Slug      string         `gorm:"not null; uniqueIndex" json:"slug" binding:"required"`
	Blocks    datatypes.JSON `json:"blocks" binding:"required"`
	Active    bool           `json:"active" gorm:"default:true"`
	Title     string         `json:"title" binding:"required" gorm:"not null"`
	ProfileID uint           `gorm:"constraint:OnDelete:CASCADE;"`
	Profile   Profile
}

type PageArgs struct {
	Slug   string         `json:"slug" binding:"required"`
	Blocks datatypes.JSON `json:"blocks" binding:"required"`
	Active bool           `json:"active" gorm:"default:true"`
	Title  string         `json:"title" binding:"required"`
}
