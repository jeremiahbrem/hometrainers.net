package services

import "gorm.io/gorm"

type ServiceProviderType interface {
	GetSession() SessionApiType
	GetUserRepo() UserRepository
}

type ServiceProvider struct {
	userRepo UserRepository
	session  SessionApiType
}

func (provider *ServiceProvider) GetSession() SessionApiType {
	return provider.session
}
func (provider *ServiceProvider) GetUserRepo() UserRepository {
	return provider.userRepo
}

func CreateServiceProvider(
	session SessionApiType,
	db *gorm.DB,
) ServiceProvider {
	return ServiceProvider{
		userRepo: UserRepository{db},
		session:  session,
	}
}
