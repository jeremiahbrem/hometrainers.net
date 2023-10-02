package database

import (
	"main/models"
)

func RunMigrations() {

	migrations := []Migration{
		{
			Name: "UpdateCity",
			Exec: func() {
				DB.Db.Migrator().AlterColumn(&models.Page{}, "City")
			},
		},
	}

	for _, m := range migrations {
		m.RunMigration()
	}
}
