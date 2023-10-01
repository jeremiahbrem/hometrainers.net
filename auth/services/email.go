package services

import (
	"crypto/tls"
	"fmt"
	"net"
	"net/mail"
	"net/smtp"
	"os"
)

type EmailArgs struct {
	To      string
	Subject string
	Body    string
}

type EmailServiceType interface {
	SendEmail(args EmailArgs) error
	SendVerificationLink(email string, code string) error
}

type EmailService struct{}

func (emailService *EmailService) SendEmail(args EmailArgs) error {
	from := mail.Address{Name: "HomeTrainers.net", Address: "support@hometrainers.net"}
	to := mail.Address{Name: "", Address: args.To}
	subj := args.Subject
	body := args.Body

	headers := make(map[string]string)
	headers["From"] = from.String()
	headers["To"] = to.String()
	headers["Subject"] = subj

	message := ""
	for k, v := range headers {
		message += fmt.Sprintf("%s: %s\r\n", k, v)
	}
	message += "\r\n" + body

	servername := "smtp.zoho.com:465"

	host, _, _ := net.SplitHostPort(servername)

	auth := smtp.PlainAuth("", "support@hometrainers.net", os.Getenv("MAIL_PASSWORD"), host)

	tlsconfig := &tls.Config{
		InsecureSkipVerify: true,
		ServerName:         host,
	}

	conn, err := tls.Dial("tcp", servername, tlsconfig)
	if err != nil {
		return err
	}

	c, err := smtp.NewClient(conn, host)
	if err != nil {
		return err
	}

	if err = c.Auth(auth); err != nil {
		return err
	}

	if err = c.Mail(from.Address); err != nil {
		return err
	}

	if err = c.Rcpt(to.Address); err != nil {
		return err
	}

	w, err := c.Data()
	if err != nil {
		return err
	}

	_, err = w.Write([]byte(message))
	if err != nil {
		return err
	}

	err = w.Close()
	if err != nil {
		return err
	}

	c.Quit()

	return nil
}

func (emailService *EmailService) SendVerificationLink(email string, code string) error {
	var host string

	if os.Getenv("ENVIRONMENT") == "PROD" {
		host = "https://auth.hometrainers.net"
	} else {
		host = "http://localhost:9096"
	}

	link := fmt.Sprintf("%s/validate-email?code=%s&email=%s", host, code, email)
	body := fmt.Sprintf("Please visit %s to validate your email address.", link)

	emailArgs := EmailArgs{
		To:      email,
		Subject: "Verify email",
		Body:    body,
	}

	err := emailService.SendEmail(emailArgs)

	return err
}
