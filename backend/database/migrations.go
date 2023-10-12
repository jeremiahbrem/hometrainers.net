package database

import "main/models"

func RunMigrations() {

	migrations := []Migration{
		{
			Name: "PageDropEmailCity",
			Exec: func() {
				DB.Db.Migrator().DropColumn(&models.Page{}, "Email")
				DB.Db.Migrator().DropColumn(&models.Page{}, "City")
			},
		},
	}

	for _, m := range migrations {
		m.RunMigration()
	}
}
