package database

import "main/models"

func RunMigrations() {

	migrations := []Migration{
		{
			Name: "PageDropEmailCity",
			Exec: func() {
				DB.Db.Migrator().DropColumn(&models.Page{}, "email")
				DB.Db.Migrator().DropColumn(&models.Page{}, "city")
			},
		},
		{
			Name: "DropImagePageId",
			Exec: func() {
				DB.Db.Migrator().DropColumn(&models.Image{}, "page_id")
			},
		},
	}

	for _, m := range migrations {
		m.RunMigration()
	}
}
