package models

import (
	"gorm.io/gorm"
)

type City struct {
	gorm.Model
	Name     string     `gorm:"not null; uniqueIndex" json:"name" binding:"required"`
	Profiles []*Profile `gorm:"many2many:city_profiles;"`
}

func (c *City) GetName() string {
	return c.Name
}
