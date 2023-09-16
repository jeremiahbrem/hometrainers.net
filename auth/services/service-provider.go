package services

import "gorm.io/gorm"

type ServiceProviderType interface {
	GetSession() SessionApiType
	GetUserRepo() UserRepository
}

type ServiceProvider struct {
	userRepo    UserRepository
	session     SessionApiType
	oauthServer OauthServerType
}

func (provider *ServiceProvider) GetSession() SessionApiType {
	return provider.session
}
func (provider *ServiceProvider) GetUserRepo() UserRepository {
	return provider.userRepo
}
func (provider *ServiceProvider) GetOauthServer() OauthServerType {
	return provider.oauthServer
}

func CreateServiceProvider(
	session SessionApiType,
	db *gorm.DB,
	oauthServer OauthServerType,
) ServiceProvider {
	return ServiceProvider{
		userRepo:    UserRepository{db},
		session:     session,
		oauthServer: oauthServer,
	}
}
