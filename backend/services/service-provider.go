package services

import "gorm.io/gorm"

type ServiceProviderType interface {
	GetPagesRepo() PageRepository
	GetEmailService() EmailServiceType
	GetUserValidator() UserValidatorType
}

type ServiceProvider struct {
	pagesRepo     PageRepository
	emailService  EmailServiceType
	userValidator UserValidatorType
}

func (provider *ServiceProvider) GetPagesRepo() PageRepository {
	return provider.pagesRepo
}
func (provider *ServiceProvider) GetEmailService() EmailServiceType {
	return provider.emailService
}
func (provider *ServiceProvider) GetUserValidator() UserValidatorType {
	return provider.userValidator
}

func CreateProvider(
	db *gorm.DB,
	emailService EmailServiceType,
	userValidator UserValidatorType,
) ServiceProviderType {
	return &ServiceProvider{
		pagesRepo:     PageRepository{db},
		emailService:  emailService,
		userValidator: userValidator,
	}
}
