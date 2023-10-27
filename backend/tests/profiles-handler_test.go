package tests

import (
	"bytes"
	"encoding/json"
	"main/controllers"
	"main/models"
	"main/services"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"gorm.io/datatypes"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func SetupProfilesTests() *gorm.DB {
	godotenv.Load("../.env")

	db, _ := gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})

	db.AutoMigrate(
		&models.Page{},
		&models.City{},
		&models.Goal{},
		&models.Profile{},
		&models.ProfileImage{},
	)

	return db
}

func TeardownProfilesTests(db *gorm.DB) {
	sql := `
		delete from pages;
		delete from profiles;
		delete from profile_images;
		delete from goals;
		delete from cities;
	`
	db.Exec(sql)
}

func TestGetProfile(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userEmail := "client@example.com"

	userValidator := MockUserValidator{
		User:  services.User{Email: userEmail},
		Valid: true,
	}

	city := models.City{
		Name: "Tulsa",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}
	goal2 := models.Goal{
		Name: "Flexibility",
	}

	db.Create(&city)
	db.Create(&goal1)
	db.Create(&goal2)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1, &goal2},
		Image:  "image.com",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/profile", nil)

	router.ServeHTTP(w, req)

	expectedProfile := controllers.ProfileResult{
		Name:   clientProfile.Name,
		Email:  clientProfile.Email,
		Type:   clientProfile.Type,
		Image:  clientProfile.Image,
		Cities: []string{clientProfile.Cities[0].Name},
		Goals:  []string{"Weight Loss", "Flexibility"},
	}

	jsonExpected, _ := json.Marshal(expectedProfile)

	assert.Equal(t, string(jsonExpected), w.Body.String())
}

func TestGetOrderedMatchingProfiles(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	city := models.City{
		Name: "Tulsa",
	}

	city2 := models.City{
		Name: "Bixby",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}
	goal2 := models.Goal{
		Name: "Muscle Gain",
	}
	goal3 := models.Goal{
		Name: "Flexibility",
	}

	db.Create(&city)
	db.Create(&city2)
	db.Create(&goal1)
	db.Create(&goal2)
	db.Create(&goal3)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1, &goal2},
	}

	trainerProfile1 := models.Profile{
		Email:  "test@example.com",
		Name:   "Tester",
		Type:   "trainer",
		Cities: []*models.City{&city, &city2},
		Goals:  []*models.Goal{&goal1, &goal2},
		Image:  "image.com",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)
	db.Omit("Citys.*").Omit("Goals.*").Create(&trainerProfile1)

	db.Create(&models.Page{
		Blocks:    datatypes.JSON([]byte(`{"blocks": [}`)),
		Slug:      "test-page",
		Title:     "Test Page",
		ProfileID: trainerProfile1.ID,
		Active:    true,
	})

	trainerProfile2 := models.Profile{
		Email:  "test2@example.com",
		Name:   "Tester2",
		Type:   "trainer",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
		Image:  "",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&trainerProfile2)

	unMatchedProfile := models.Profile{
		Email:  "test3@example.com",
		Name:   "Tester3",
		Type:   "trainer",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal3},
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&unMatchedProfile)

	db.Create(&models.Page{
		Blocks:    datatypes.JSON([]byte(`{"blocks": [}`)),
		Slug:      "test-page-2",
		Title:     "Test Page 2",
		ProfileID: trainerProfile2.ID,
		Active:    true,
	})

	userValidator := MockUserValidator{
		User:  services.User{Email: clientProfile.Email},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/matching-profiles", nil)

	router.ServeHTTP(w, req)

	expected := make([]controllers.TrainerResult, 2)

	expected[0] = controllers.TrainerResult{
		Name:   trainerProfile1.Name,
		Image:  trainerProfile1.Image,
		Slug:   "test-page",
		Cities: []string{"Tulsa", "Bixby"},
		Goals:  []string{"Weight Loss", "Muscle Gain"},
	}
	expected[1] = controllers.TrainerResult{
		Name:   trainerProfile2.Name,
		Image:  trainerProfile2.Image,
		Slug:   "test-page-2",
		Cities: []string{"Tulsa"},
		Goals:  []string{"Weight Loss"},
	}

	jsonExpected, _ := json.Marshal(expected)

	assert.Equal(t, string(jsonExpected), w.Body.String())
}

func TestGetEmptyMatchingResults(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	city := models.City{
		Name: "Tulsa",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}

	db.Create(&city)
	db.Create(&goal1)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	userValidator := MockUserValidator{
		User:  services.User{Email: clientProfile.Email},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/matching-profiles", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, "[]", w.Body.String())
}

func TestGetMatchingProfilesNoClientProfile(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: "client@example.com"},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/matching-profiles", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "profile required")
}

func TestGetMatchingProfilesNoClientCity(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	goal1 := models.Goal{
		Name: "Weight Loss",
	}

	db.Create(&goal1)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{},
		Goals:  []*models.Goal{&goal1},
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	userValidator := MockUserValidator{
		User:  services.User{Email: clientProfile.Email},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/matching-profiles", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "city required")
}

func TestGetMatchingProfilesNoClientGoal(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	city := models.City{
		Name: "Houston",
	}

	db.Create(&city)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{},
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	userValidator := MockUserValidator{
		User:  services.User{Email: clientProfile.Email},
		Valid: true,
	}

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("GET", "/matching-profiles", nil)

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "at least one goal required")
}

func TestCreateProfile(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userEmail := "client@example.com"

	userValidator := MockUserValidator{
		User:  services.User{Email: userEmail},
		Valid: true,
	}

	args := models.ProfileArgs{
		Name:   "Sarah Connor",
		Type:   "Client",
		Image:  "image.com",
		Cities: []string{"Round Rock"},
		Goals:  []string{"Senior Fitness", "Flexibility"},
	}

	marshalled, _ := json.Marshal(args)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/update-profile", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Profile created")

	var newProfile models.Profile

	db.Model(&models.Profile{}).Preload("Cities").Preload("Goals").First(&newProfile)

	assert.Equal(t, args.Name, newProfile.Name)
	assert.Equal(t, args.Type, newProfile.Type)
	assert.Equal(t, userEmail, newProfile.Email)
	assert.Equal(t, args.Image, newProfile.Image)
	assert.Equal(t, args.Cities[0], newProfile.Cities[0].Name)

	newProfileGoals := make([]string, 0)
	for _, v := range newProfile.Goals {
		newProfileGoals = append(newProfileGoals, v.Name)
	}

	assert.Equal(t, args.Goals, newProfileGoals)
}

func TestUpdateProfile(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userEmail := "client@example.com"

	userValidator := MockUserValidator{
		User:  services.User{Email: userEmail},
		Valid: true,
	}

	city := models.City{
		Name: "Tulsa",
	}
	city2 := models.City{
		Name: "Owasso",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}
	goal2 := models.Goal{
		Name: "Flexibility",
	}
	goal3 := models.Goal{
		Name: "Endurance",
	}

	db.Create(&city)
	db.Create(&city2)
	db.Create(&goal1)
	db.Create(&goal2)
	db.Create(&goal3)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
		Image:  "",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	args := models.ProfileArgs{
		Name:   clientProfile.Email,
		Type:   "client",
		Image:  "image.com",
		Cities: []string{"Owasso"},
		Goals:  []string{"Endurance", "Flexibility"},
	}

	marshalled, _ := json.Marshal(args)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/update-profile", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Contains(t, w.Body.String(), "Profile updated")

	var updatedProfile models.Profile

	db.Model(&models.Profile{}).Preload("Cities").Preload("Goals").First(&updatedProfile)

	assert.Equal(t, args.Name, updatedProfile.Name)
	assert.Equal(t, args.Type, updatedProfile.Type)
	assert.Equal(t, userEmail, updatedProfile.Email)
	assert.Equal(t, args.Image, updatedProfile.Image)
	assert.Equal(t, args.Cities[0], updatedProfile.Cities[0].Name)

	newProfileGoals := make([]string, 0)
	for _, v := range updatedProfile.Goals {
		newProfileGoals = append(newProfileGoals, v.Name)
	}

	assert.ElementsMatch(t, args.Goals, newProfileGoals)
}

func TestUpdateProfileNoGoals(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userEmail := "client@example.com"

	userValidator := MockUserValidator{
		User:  services.User{Email: userEmail},
		Valid: true,
	}

	city := models.City{
		Name: "Tulsa",
	}
	city2 := models.City{
		Name: "Owasso",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}

	db.Create(&city)
	db.Create(&city2)
	db.Create(&goal1)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
		Image:  "",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	args := models.ProfileArgs{
		Name:   clientProfile.Email,
		Type:   "client",
		Image:  "image.com",
		Cities: []string{"Owasso"},
		Goals:  []string{},
	}

	marshalled, _ := json.Marshal(args)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/update-profile", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "Goal required")
}

func TestUpdateProfileNoCity(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userEmail := "client@example.com"

	userValidator := MockUserValidator{
		User:  services.User{Email: userEmail},
		Valid: true,
	}

	city := models.City{
		Name: "Tulsa",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}

	db.Create(&city)
	db.Create(&goal1)

	clientProfile := models.Profile{
		Email:  "client@example.com",
		Name:   "Client",
		Type:   "client",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
		Image:  "",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&clientProfile)

	args := models.ProfileArgs{
		Name:   clientProfile.Email,
		Type:   "client",
		Image:  "image.com",
		Cities: []string{},
		Goals:  []string{"Endurance", "Flexibility"},
	}

	marshalled, _ := json.Marshal(args)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/update-profile", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
	assert.Contains(t, w.Body.String(), "City required")
}

func TestProfileImageAdded(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	city := models.City{
		Name: "Tulsa",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}

	db.Create(&city)
	db.Create(&goal1)

	trainerProfile := models.Profile{
		Email:  trainerEmail,
		Name:   "Trainer",
		Type:   "trainer",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
		Image:  "",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&trainerProfile)

	args := models.ProfileArgs{
		Name:   "Sarah Connor",
		Type:   "trainer",
		Image:  "image.com",
		Cities: []string{"Round Rock"},
		Goals:  []string{"Senior Fitness", "Flexibility"},
	}

	marshalled, _ := json.Marshal(args)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator)

	req, _ := http.NewRequest("POST", "/update-profile", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var newImage *models.ProfileImage
	db.Where("email = ?", trainerEmail).First(&newImage)

	assert.Equal(t, "image.com", newImage.Path)
}

func TestProfileImageDelete(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	userValidator := MockUserValidator{
		User:  services.User{Email: trainerEmail},
		Valid: true,
	}

	bucketService := MockBucketService{}

	city := models.City{
		Name: "Tulsa",
	}

	goal1 := models.Goal{
		Name: "Weight Loss",
	}

	db.Create(&city)
	db.Create(&goal1)

	trainerProfile := models.Profile{
		Email:  trainerEmail,
		Name:   "Trainer",
		Type:   "trainer",
		Cities: []*models.City{&city},
		Goals:  []*models.Goal{&goal1},
		Image:  "image.com",
	}

	db.Omit("Citys.*").Omit("Goals.*").Create(&trainerProfile)

	profileImage := models.ProfileImage{
		Email: trainerEmail,
		Path:  "image.com",
	}

	db.Create(&profileImage)

	args := models.ProfileArgs{
		Name:   "Sarah Connor",
		Type:   "trainer",
		Image:  "",
		Cities: []string{"Round Rock"},
		Goals:  []string{"Senior Fitness", "Flexibility"},
	}

	marshalled, _ := json.Marshal(args)

	w := httptest.NewRecorder()

	router := SetupRouter(db, &userValidator, &bucketService)

	req, _ := http.NewRequest("POST", "/update-profile", bytes.NewReader(marshalled))

	router.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)

	var newImage *models.Image
	err := db.Where("email = ?", trainerEmail).First(&newImage).Error

	assert.NotNil(t, err)
	assert.Equal(t, "image.com", bucketService.NameArg)
}

func TestGetAllCities(t *testing.T) {
	db := SetupProfilesTests()
	defer TeardownProfilesTests(db)

	city := models.City{
		Name: "Tulsa",
	}
	city2 := models.City{
		Name: "Owasso",
	}
	city3 := models.City{
		Name: "Dallas",
	}

	db.Create(&city)
	db.Create(&city2)
	db.Create(&city3)

	w := httptest.NewRecorder()

	router := SetupRouter(db)

	req, _ := http.NewRequest("GET", "/cities", nil)

	router.ServeHTTP(w, req)

	expected := []string{
		"Dallas",
		"Owasso",
		"Tulsa",
	}

	jsonExpected, _ := json.Marshal(expected)

	assert.Equal(t, string(jsonExpected), w.Body.String())
}
