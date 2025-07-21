package utils

import (
	"bytes"
	"fmt"
	"strconv"
	"text/template"
	"time"

	"github.com/go-gomail/gomail"
	"github.com/labring/sealos/controllers/pkg/types"
)

type SMTPConfig struct {
	ServerHost string
	ServerPort int
	Username   string
	FromEmail  string
	Passwd     string
	EmailTitle string
}

func (c *SMTPConfig) SendEmail(emailBody, to string) error {
	m := gomail.NewMessage()
	m.SetHeader("To", to)
	m.SetAddressHeader("From", c.FromEmail, c.EmailTitle)
	m.SetHeader("Subject", c.EmailTitle)
	m.SetBody("text/html", emailBody)
	d := gomail.NewDialer(c.ServerHost, c.ServerPort, c.Username, c.Passwd)
	return d.DialAndSend(m)
}

func (c *SMTPConfig) SendEmailWithSubject(subject, emailBody, to string) error {
	m := gomail.NewMessage()
	m.SetHeader("To", to)
	m.SetAddressHeader("From", c.FromEmail, c.EmailTitle)
	m.SetHeader("Subject", subject)
	m.SetBody("text/html", emailBody)
	d := gomail.NewDialer(c.ServerHost, c.ServerPort, c.Username, c.Passwd)
	return d.DialAndSend(m)
}

var (
	EnvSMTPHost     = "SMTP_HOST"
	EnvSMTPPort     = "SMTP_PORT"
	EnvSMTPFrom     = "SMTP_FROM"
	EnvSMTPUser     = "SMTP_USER"
	EnvSMTPPassword = "SMTP_PASSWORD"
	EnvSMTPTitle    = "SMTP_TITLE"

	PaySuccess        EmailType = "PAY_SUCCESS"
	PayFailed         EmailType = "PAY_FAILED"
	SubMouthlySuccess EmailType = "SUB_MOUTHLY_SUCCESS"
	SubYearlySuccess  EmailType = "SUB_YEARLY_SUCCESS"
	SubFailedEmail    EmailType = "SUB_FAILED"
)

type EmailRenderBuilder interface {
	Build() map[string]interface{}
	GetType() EmailType
	SetUserInfo(userInfo *types.UserInfo)
	GetSubject() string
	Render() (string, error)
}

type EmailPayRender struct {
	Type           EmailType
	userInfo       *types.UserInfo
	Domain         string
	TopUpAmount    int64
	AccountBalance int64
}

type EmailType string

func (e *EmailPayRender) Build() map[string]interface{} {
	return map[string]interface{}{
		"FirstName":      e.userInfo.FirstName,
		"LastName":       e.userInfo.LastName,
		"Domain":         e.Domain,
		"TopUpAmount":    strconv.FormatInt(e.TopUpAmount, 10),
		"AccountBalance": strconv.FormatInt(e.AccountBalance, 10),
	}
}

func (e *EmailPayRender) GetType() EmailType {
	return e.Type
}

func (e *EmailPayRender) GetSubject() string {
	return "Top-Up Successful"
}

func (e *EmailPayRender) SetUserInfo(userInfo *types.UserInfo) {
	e.userInfo = userInfo
}

func (e *EmailSubRender) Build() map[string]interface{} {
	build := map[string]interface{}{
		"FirstName":            e.UserInfo.FirstName,
		"LastName":             e.UserInfo.LastName,
		"Domain":               e.Domain,
		"SubscriptionPlanName": e.SubscriptionPlanName,
		"StartDate":            e.StartDate.Format("2006-01-02"),
		"EndDate":              e.EndDate.Format("2006-01-02"),
	}
	switch e.SubscriptionPlanName {
	case "Hobby":
		build["SubscriptionFeatures"] = []string{
			"Includes $5 credits",
			"16 vCPU / 32GiB RAM",
			"Unlimited disk & traffic within plan",
			"Multiple regions",
			"3 workspaces / region",
			"5 seats / workspace",
		}
	case "Pro":
		build["SubscriptionFeatures"] = []string{
			"Includes $20 credits",
			"128 vCPU / 256GiB RAM",
			"Unlimited disk & traffic within plan",
			"Multiple regions",
			"Multiple workspace / region",
			"Multiple seat / workspace",
		}
	}
	return build
}

type EmailSubRender struct {
	Type     EmailType
	Operator types.SubscriptionOperator

	UserInfo types.UserInfo
	Domain   string

	SubscriptionPlanName string
	Period               types.SubscriptionPeriod
	StartDate            time.Time
	EndDate              time.Time
}

func (e *EmailSubRender) GetType() EmailType {
	return e.Type
}

func (e *EmailSubRender) SetUserInfo(userInfo *types.UserInfo) {
	e.UserInfo = *userInfo
}

func (e *EmailSubRender) GetSubject() string {
	switch e.Operator {
	case types.SubscriptionTransactionTypeCreated:
		if e.Period == types.SubscriptionPeriodYearly {
			return "You're All Set – ClawCloud Run Annual Subscription Confirmed"
		}
		return "Your Subscription Has Been Successfully Created"
	case types.SubscriptionTransactionTypeRenewed:
		if e.Period == types.SubscriptionPeriodYearly {
			return "You're All Set – ClawCloud Run Annual Subscription Confirmed"
		}
		return "Your Subscription Has Been Successfully Renewed"
	case types.SubscriptionTransactionTypeUpgraded:
		if e.Period == types.SubscriptionPeriodYearly {
			return "You're All Set – ClawCloud Run Annual Subscription Confirmed"
		}
		return "Your Subscription Has Been Successfully Updated"
	case types.SubscriptionTransactionTypeDowngraded:
		return "Your Subscription Has Been Successfully Downgraded"
	case types.SubscriptionTransactionTypeCanceled:
		return "Your Subscription Has Been Successfully Canceled"
	}
	return "Your Subscription Has Been Successfully Activated"
}

func (e *EmailSubRender) Render() (string, error) {
	txt := subMouthlySuccessRenderTmpl
	if e.Period == types.SubscriptionPeriodYearly {
		txt = subYearlySuccessRenderTmpl
	}
	funcMap := template.FuncMap{
		"sub": func(a, b int) int {
			return a - b
		},
	}
	t, err := template.New("email").Funcs(funcMap).Parse(txt)
	if err != nil {
		return "", fmt.Errorf("failed to parse email template: %v", err)
	}
	var rendered bytes.Buffer
	if err = t.Execute(&rendered, e.Build()); err != nil {
		return "", fmt.Errorf("failed to render email template: %v", err)
	}
	return rendered.String(), nil
}

type EmailDebtRender struct {
	Type          string
	CurrentStatus types.DebtStatusType

	userInfo    types.UserInfo
	Domain      string
	GraceReason []string
}

type DebtGraceReason string

const (
	GraceReasonNoBalance  DebtGraceReason = "insufficient balance"
	GraceReasonSubExpired DebtGraceReason = "subscription expired"
)

func (e *EmailDebtRender) GetType() string {
	return e.Type
}

func (e *EmailDebtRender) SetUserInfo(userInfo *types.UserInfo) {
	e.userInfo = *userInfo
}

func (e *EmailDebtRender) GetSubject() string {
	if types.ContainDebtStatus(types.DebtStates, e.CurrentStatus) {
		if e.CurrentStatus == types.FinalDeletionPeriod {
			return "Important: Your Resources Had Expired"
		}
		return "Important: Your Account Has Entered Grace Period"
	}
	return "Low Account Balance Reminder"
}

func (e *EmailDebtRender) Build() map[string]interface{} {
	build := map[string]interface{}{
		"FirstName":   e.userInfo.FirstName,
		"LastName":    e.userInfo.LastName,
		"Domain":      e.Domain,
		"GraceReason": e.GraceReason,
	}
	if e.Type == "CriticalBalancePeriod" {
		build["CreditsAvailable"] = "1"
	}
	if e.Type == "LowBalancePeriod" {
		build["CreditsAvailable"] = "5"
	}
	return build
}

func (e *EmailPayRender) Render() (string, error) {
	tmpl, err := template.New(string(e.Type)).Parse(paySuccessRenderTmpl)
	if err != nil {
		return "", fmt.Errorf("failed to parse email template: %w", err)
	}
	var rendered bytes.Buffer
	if err = tmpl.Execute(&rendered, e.Build()); err != nil {
		return "", fmt.Errorf("failed to render email template: %w", err)
	}
	return rendered.String(), nil
}

// var (
//
//	EnvPaySuccessEmailTmpl EmailType = "PAY_SUCCESS_EMAIL_TMPL"
//	EnvPayFailedEmailTmpl  EmailType = "PAY_FAILED_EMAIL_TMPL"
//	EnvSubSuccessEmailTmpl EmailType = "SUB_SUCCESS_EMAIL_TMPL"
//	EnvSubFailedEmailTmpl  EmailType = "SUB_FAILED_EMAIL_TMPL"
//
// )
const subMouthlySuccessRenderTmpl = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClawCloud Subscription Activated</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
          style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
                      <td style="background: linear-gradient(270deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%); 
                       height: 120px;
                       text-align: center;
                       vertical-align: middle;
                       padding: 20px 0;">
                        <img src="https://objectstorageapi.us-east-1.clawcloudrun.com/nog6na79-admin/cc-run-white.svg" alt="ClawCloud Logo" width="217" height="auto"
                          style="display: inline-block;">
                      </td>
                    </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 48px;">
              <h2 style="margin: 0; font-size: 28px; color: #000; font-weight: 700;">Dear {{.FirstName}} {{.LastName}}
              </h2>
              <p style="margin: 12px 0px 24px 0px; font-size: 16px; color: #000; line-height: 1.6;">
                Congratulations!<br>
                Your {{.SubscriptionPlanName}} Plan has been successfully activated. Below are the details of your
                subscription:
              </p>
              <div style="margin: 24px 0;
              padding: 24px;
              border-radius: 12px;
              border: 1px solid #E4E4E7;
              background: #FFF;
              box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
              ">
                <h3 style="margin: 0 0 10px 0; font-size: 24px; color: #4285f4; font-weight: 700; position: relative;">
                  {{.SubscriptionPlanName}}<span
                    style="position: absolute; top: 0; margin-left: 5px; font-size: 20px; color: #4285f4;">✧</span>
                </h3>
                <div
                  style="font-size: 16px; color: #666; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #eee;">
                  from {{.StartDate}} - {{.EndDate}}
                </div>
                {{- range $index, $feature := .SubscriptionFeatures }}
                <div
                  style="display: flex; align-items: center; {{ if ne $index (sub (len $.SubscriptionFeatures) 1) }}margin-bottom: 12px;{{ end }} gap: 8px;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <g clip-path="url(#clip0_741_51174)">
                      <path
                        d="M6.00016 8.00016L7.3335 9.3335L10.0002 6.66683M14.6668 8.00016C14.6668 11.6821 11.6821 14.6668 8.00016 14.6668C4.31826 14.6668 1.3335 11.6821 1.3335 8.00016C1.3335 4.31826 4.31826 1.3335 8.00016 1.3335C11.6821 1.3335 14.6668 4.31826 14.6668 8.00016Z"
                        stroke="black" stroke-opacity="0.4" stroke-width="1.33" stroke-linecap="round"
                        stroke-linejoin="round" />
                    </g>
                    <defs>
                      <clipPath id="clip0_741_51174">
                        <rect width="16" height="16" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                  <div style="font-size: 16px; color: #333;">{{ $feature }}</div>
                </div>
                {{- end }}
              </div>
              <p style="margin: 20px 0 0; font-size: 16px; font-weight: 400; color: #000; line-height: 1.6;">
                If you have any questions, please feel free to contact our support team.
              </p>
              <p style="margin: 30px 0 0; font-size: 18px; color: #000; font-weight: 700;">
                Thank you for choosing us!
              </p>
              <p style="margin: 5px 0 0; font-size: 14px; color: #000;">
                Clawcloud (Singapore) Private Limited<br>
                support@run.claw.cloud
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const subYearlySuccessRenderTmpl = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClawCloud Subscription Activated</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f6f9;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f6f9;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
          style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(270deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%); 
                     height: 120px;
                     text-align: center;
                     vertical-align: middle;
                     padding: 20px 0;">
              <img src="https://objectstorageapi.us-east-1.clawcloudrun.com/nog6na79-admin/cc-run-white.svg" alt="ClawCloud Logo" width="217" height="auto"
                style="display: inline-block;">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 48px;">
              <h2 style="margin: 0 0 16px; font-size: 28px; color: #2c3e50; font-weight: 700;">Hi, {{.FirstName}} {{.LastName}}</h2>
              <p style="margin: 0 0 24px; font-size: 18px; color: #34495e; line-height: 1.6;">
                Thanks for subscribing to our annual plan!🎉 Your subscription has been successfully activated.
              </p>
              <!-- Plan Details Section -->
              <div style="margin: 0 0 32px; padding: 24px; border-left: 4px solid #3498db; background-color: #ecf0f1; border-radius: 8px;">
                <strong style="display: block; margin-bottom: 8px; font-size: 18px; color: #2c3e50;">Plan Details:</strong>
                <p style="margin: 0; font-size: 16px; color: #34495e; line-height: 1.6;">
                  Subscription Type: Annual {{.SubscriptionPlanName}}<br>
                  Payment: One-time payment (no auto-renewal)
                </p>
              </div>
              <p style="margin: 0 0 24px; font-size: 18px; color: #34495e; line-height: 1.6;">
                No need to worry about recurring charges — your plan will remain active for 12 months, and we won’t process another payment unless you decide to renew manually.
              </p>
              <p style="margin: 0 0 32px; font-size: 18px; color: #34495e; line-height: 1.6;">
                We’ll send you a reminder before the term ends so you can renew if you'd like to continue enjoying our services.
              </p>
              <p style="margin: 0 0 16px; font-size: 20px; color: #2c3e50; font-weight: 600;">
                Thank you for choosing us!
              </p>
              <p style="margin: 0; font-size: 16px; color: #34495e;">
                Clawcloud (Singapore) Private Limited<br>
                support@run.claw.cloud
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const paySuccessRenderTmpl = `<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ClawCloud Account Top-up Confirmation</title>
</head>

<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f4f4;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600"
          style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(270deg, #2778FD 3.93%, #2778FD 18.25%, #829DFE 80.66%); 
             height: 120px;
             text-align: center;
             vertical-align: middle;
             padding: 20px 0;">
              <img src="https://objectstorageapi.us-east-1.clawcloudrun.com/nog6na79-admin/cc-run-white.svg" alt="ClawCloud Logo" width="217" height="auto"
                style="display: inline-block;">
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 48px;">
              <h2 style="margin: 0; font-size: 28px; color: #000; font-weight: 700;">Dear {{.FirstName}} {{.LastName}}</h2>
              <p style="margin: 24px 0; font-size: 16px; color: #000; line-height: 1.6;">
                Your account has been successfully topped up with {{.TopUpAmount}}. Your current account balance is
                {{.AccountBalance}}.
              </p>

              <!-- Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"
                style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="{{.Domain}}/account" style="display: inline-block;
                             padding: 14px 24px;
                             width: 100%;
                             box-sizing: border-box;
                             text-align: center;
                             border-radius: 8px;
                             background: #18181B;
                             color: #ffffff;
                             text-decoration: none;
                             font-size: 16px;
                             font-weight: 500;
                             cursor: pointer;">
                      Visit Account
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer Text -->
              <p style="margin: 32px 0 0; font-size: 16px; font-weight: 400; color: #000; line-height: 1.6;">
                If you have any questions, please feel free to contact our support team.
              </p>
              <p style="margin: 24px 0 0; font-size: 16px; color: #000; font-weight: 700;">
                Thank you for your support!
              </p>
              <p style="margin: 8px 0 0; font-size: 14px; color: #444;">
                Clawcloud (Singapore) Private Limited<br>
                support@run.claw.cloud
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>

</html>`
