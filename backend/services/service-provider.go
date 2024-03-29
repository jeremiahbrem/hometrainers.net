package services

import "gorm.io/gorm"

type ServiceProviderType interface {
	GetPagesRepo() PageRepository
	GetProfilesRepo() ProfileRepository
	GetEmailService() EmailServiceType
	GetUserValidator() UserValidatorType
	GetBucketService() BucketServiceType
}

type ServiceProvider struct {
	pagesRepo     PageRepository
	profilesRepo  ProfileRepository
	emailService  EmailServiceType
	userValidator UserValidatorType
	bucketService BucketServiceType
}

func (provider *ServiceProvider) GetPagesRepo() PageRepository {
	return provider.pagesRepo
}
func (provider *ServiceProvider) GetProfilesRepo() ProfileRepository {
	return provider.profilesRepo
}
func (provider *ServiceProvider) GetEmailService() EmailServiceType {
	return provider.emailService
}
func (provider *ServiceProvider) GetUserValidator() UserValidatorType {
	return provider.userValidator
}
func (provider *ServiceProvider) GetBucketService() BucketServiceType {
	return provider.bucketService
}

func CreateProvider(
	db *gorm.DB,
	emailService EmailServiceType,
	userValidator UserValidatorType,
	bucketService BucketServiceType,
) ServiceProviderType {
	return &ServiceProvider{
		pagesRepo:     PageRepository{db},
		profilesRepo:  ProfileRepository{db},
		emailService:  emailService,
		userValidator: userValidator,
		bucketService: bucketService,
	}
}
