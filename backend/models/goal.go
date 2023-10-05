package models

import (
	"gorm.io/gorm"
)

type Goal struct {
	gorm.Model
	Name     string     `gorm:"not null; uniqueIndex" json:"name" binding:"required"`
	Profiles []*Profile `gorm:"many2many:goal_profiles;"`
}

func (c *Goal) GetName() string {
	return c.Name
}
