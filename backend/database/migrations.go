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
		{
			Name: "AddGoals",
			Exec: func() {

				var createIfNotExists = func(name string) {
					goal := models.Goal{}
					DB.Db.FirstOrCreate(&goal, (models.Goal{Name: name}))
				}
				createIfNotExists("Weight Loss")
				createIfNotExists("Balance")
				createIfNotExists("Muscle Gain")
				createIfNotExists("Flexibility")
				createIfNotExists("Endurance")
				createIfNotExists("Cardiovascular Fitness")
				createIfNotExists("Senior Fitness")
				createIfNotExists("Sports Performance")
				createIfNotExists("Strength")
				createIfNotExists("Prenatal Fitness")
				createIfNotExists("Post Rehabilitation")
				createIfNotExists("Toning")
				createIfNotExists("Youth Fitness")
			},
		},
	}

	for _, m := range migrations {
		m.RunMigration()
	}
}
