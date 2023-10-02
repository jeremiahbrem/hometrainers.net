package database

import (
	"gorm.io/gorm"
)

type MigrationType interface {
	RunMigration()
	CreateIfNotExists()
}

type Migration struct {
	gorm.Model
	Name string `gorm:"not null; uniqueIndex"`
	Exec func() `gorm:"-"`
}

func (m *Migration) RunMigration() {
	var migration Migration
	if err := DB.Db.Where("name = ?", m.Name).First(&migration).Error; err != nil {
		DB.Db.Create(&Migration{
			Name: m.Name,
		})
		migration.Exec()
	}
}
