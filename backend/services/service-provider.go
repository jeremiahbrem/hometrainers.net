package services

import "gorm.io/gorm"

type ServiceProviderType interface {
	GetPagesRepo() PageRepository
}

type ServiceProvider struct {
	pagesRepo PageRepository
}

func (provider *ServiceProvider) GetPagesRepo() PageRepository {
	return provider.pagesRepo
}

func CreateProvider(db *gorm.DB) ServiceProviderType {
	return &ServiceProvider{
		pagesRepo: PageRepository{db},
	}
}
