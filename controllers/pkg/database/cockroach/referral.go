package cockroach

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/labring/sealos/controllers/pkg/types"
	"gorm.io/gorm"
	"time"
)

func GetReferrerUID(ctx context.Context, db *gorm.DB, uid uuid.UUID) (userUID uuid.UUID, referrerID uuid.UUID, err error) {
	var resultScan types.Referral
	query := `
        SELECT uid,id AS referrer_id
        FROM referral 
        WHERE id = (SELECT referrer_id FROM referral WHERE uid = ?)
    `
	result := db.WithContext(ctx).Raw(query, uid).Scan(&resultScan)
	if errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return uuid.Nil, uuid.Nil, nil // Return zero UUID if no referrer found
	}
	if result.Error != nil {
		return uuid.Nil, uuid.Nil, fmt.Errorf("failed to query referrer UID: %w", result.Error)
	}
	return resultScan.UID, resultScan.ReferrerID, nil
}

// referral 和 referrer

// 赠送邀请者订阅
func (c *Cockroach) ReferrerUserSubscription(db *gorm.DB, userUid, referrerID uuid.UUID, amount int64) error {
	sub, err := c.GetSubscription(&types.UserQueryOpts{UID: userUid})
	if err != nil {
		return fmt.Errorf("failed to get user subscription: %v", err)
	}
	now := time.Now().UTC()

	hobbyPlan, err := c.GetSubscriptionPlan("Hobby")
	if err != nil {
		return fmt.Errorf("failed to get hobby subscription plan")
	}
	proPlan, err := c.GetSubscriptionPlan("Pro")
	if err != nil {
		return fmt.Errorf("failed to get pro subscription plan")
	}
	var subTransaction = &types.SubscriptionTransaction{
		UserUID:        userUid,
		SubscriptionID: sub.ID,
		OldPlanName:    sub.PlanName,
		OldPlanID:      sub.PlanID,
		NewPlanName:    sub.PlanName,
		NewPlanID:      sub.ID,
		Status:         types.SubscriptionTransactionStatusCompleted,
		PayPeriod:      types.SubscriptionPeriodMonthly,
		PayStatus:      types.SubscriptionPayStatusNoNeed,
		StartAt:        now,
		Operator:       types.SubscriptionTransactionTypeRenewed,
	}
	switch sub.PlanName {
	case types.HobbySubscriptionPlanName, types.ProSubscriptionPlanName:
		if sub.PlanName == types.ProSubscriptionPlanName && amount != proPlan.Amount && amount != proPlan.AnnualAmount {
			// pro 用户必须邀请同样充值pro的新用户才可以获得referrer赠送
			return nil
		}
		// 追加一个月时常
		if sub.ExpireAt.Before(now) {
			sub.ExpireAt = now.AddDate(0, 1, 0)
		} else {
			sub.ExpireAt = sub.ExpireAt.AddDate(0, 1, 0)
		}
		sub.Status = types.SubscriptionStatusNormal
		sub.UpdateAt = now
		if err = db.Save(sub).Error; err != nil {
			return fmt.Errorf("failed to save subscription: %v", err)
		}
	case types.FreeSubscriptionPlanName:
		// TODO 交给controller 去处理
		subTransaction.NewPlanName = hobbyPlan.Name
		subTransaction.NewPlanID = hobbyPlan.ID
		subTransaction.Status = types.SubscriptionTransactionStatusPending
		subTransaction.PayPeriod = types.SubscriptionPeriodMonthly
		subTransaction.Operator = types.SubscriptionTransactionTypeCreated
	default:
		// TODO 其他情况 Pro订阅暂时跳过
		fmt.Printf("unknown subscription plan: %s, skip referrer user: %s", sub.PlanName, userUid)
		return nil
	}
	if err := db.Create(subTransaction).Error; err != nil {
		return fmt.Errorf("failed to create subscription transaction: %v", err)
	}
	return db.Model(&types.ReferralReward{}).Create(&types.ReferralReward{
		ID:         uuid.New(),
		ReferralID: referrerID,
		Reward:     types.ONE_MONTH_HOBBY_LICENSE,
		CreatedAt:  now,
		UpdatedAt:  now,
	}).Error
}
