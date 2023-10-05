package models

import (
	"gorm.io/gorm"
)

type Profile struct {
	gorm.Model
	Email  string `gorm:"not null; uniqueIndex" json:"email" binding:"required"`
	Name   string `gorm:"not null" json:"name" binding:"required"`
	Type   string `gorm:"not null"`
	Image  string
	Cities []*City `gorm:"many2many:city_profiles;"`
	Goals  []*Goal `gorm:"many2many:goal_profiles;"`
}

type ProfileArgs struct {
	Name   string   `json:"name" binding:"required"`
	Type   string   `json:"type" binding:"required"`
	Image  string   `json:"image"`
	Cities []string `json:"cities"`
	Goals  []string `json:"goals"`
}
