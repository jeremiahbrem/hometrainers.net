package mocks

import (
	"server/services"
)

type MockEmailService struct {
	Args              services.EmailArgs
	VerificationEmail string
	ValidationCode    string
}

func (emailService *MockEmailService) SendEmail(args services.EmailArgs) error {
	emailService.Args = args
	return nil
}

func (emailService *MockEmailService) SendVerificationLink(email string, code string) error {
	emailService.VerificationEmail = email
	emailService.ValidationCode = code
	return nil
}
