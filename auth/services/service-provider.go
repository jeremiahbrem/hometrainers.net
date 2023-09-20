package services

import "gorm.io/gorm"

type ServiceProviderType interface {
	GetClock() ClockType
	GetSession() SessionApiType
	GetUserRepo() UserRepository
	GetOauthServer() OauthServerType
	GetEmailService() EmailServiceType
	GetCodeGenerator() CodeGeneratorType
}

type ServiceProvider struct {
	userRepo      UserRepository
	session       SessionApiType
	oauthServer   OauthServerType
	emailService  EmailServiceType
	codeGenerator CodeGeneratorType
	clock         ClockType
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
func (provider *ServiceProvider) GetEmailService() EmailServiceType {
	return provider.emailService
}
func (provider *ServiceProvider) GetCodeGenerator() CodeGeneratorType {
	return provider.codeGenerator
}
func (provider *ServiceProvider) GetClock() ClockType {
	return provider.clock
}

func CreateServiceProvider(
	session SessionApiType,
	db *gorm.DB,
	oauthServer OauthServerType,
	emailService EmailServiceType,
	codeGenerator CodeGeneratorType,
	clock ClockType,
) ServiceProvider {
	return ServiceProvider{
		session:       session,
		oauthServer:   oauthServer,
		emailService:  emailService,
		codeGenerator: codeGenerator,
		clock:         clock,
		userRepo: UserRepository{
			db:    db,
			clock: clock,
		},
	}
}
