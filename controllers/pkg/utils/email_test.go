package utils_test

import (
	"github.com/labring/sealos/controllers/pkg/types"
	"github.com/labring/sealos/controllers/pkg/utils"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestEmailSubRender_Render(t *testing.T) {
	now := time.Now()
	endDate := now.AddDate(0, 1, 0) // 下个月

	tests := []struct {
		name         string
		emailType    utils.EmailType
		operator     types.SubscriptionOperator
		period       types.SubscriptionPeriod
		expectedBody string
	}{
		{
			name:      "Monthly Created Subscription Success",
			emailType: utils.SubMouthlySuccess,
			operator:  types.SubscriptionTransactionTypeCreated,
			period:    types.SubscriptionPeriodMonthly,
		},
		{
			name:      "Yearly Created Subscription Success",
			emailType: utils.SubYearlySuccess,
			operator:  types.SubscriptionTransactionTypeCreated,
			period:    types.SubscriptionPeriodYearly,
		},
		{
			name:      "Monthly Upgraded Subscription Success",
			emailType: utils.SubMouthlySuccess,
			operator:  types.SubscriptionTransactionTypeUpgraded,
			period:    types.SubscriptionPeriodMonthly,
		},
		{
			name:      "Yearly Upgraded Subscription Success",
			emailType: utils.SubYearlySuccess,
			operator:  types.SubscriptionTransactionTypeUpgraded,
			period:    types.SubscriptionPeriodYearly,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			subRender := &utils.EmailSubRender{
				Type:                 tt.emailType,
				Operator:             tt.operator,
				Domain:               "https://example.com",
				UserInfo:             types.UserInfo{FirstName: "John", LastName: "Doe"},
				SubscriptionPlanName: "Hobby",
				Period:               tt.period,
				StartDate:            now,
				EndDate:              endDate,
			}

			renderedHTML, err := subRender.Render()
			assert.NoError(t, err)
			assert.NotEmpty(t, renderedHTML)

			// 可选：验证渲染结果中是否包含关键字符串
			//assert.Contains(t, renderedHTML, "Dear John Doe")
			//assert.Contains(t, renderedHTML, "Hobby Plan")
			// 打印html
			t.Log(renderedHTML)
		})
	}
}
