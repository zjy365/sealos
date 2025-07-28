package types

import (
	"github.com/google/uuid"
	"time"
)

type Referral struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code       uuid.UUID `json:"code" gorm:"unique;not null"`
	UID        uuid.UUID `json:"uid" gorm:"unique;not null"`
	ReferrerID uuid.UUID `json:"referrerID" gorm:"column:referrer_id"`
	CreatedAt  time.Time `json:"createdAt" gorm:"default:current_timestamp()"`
	UpdatedAt  time.Time `json:"updatedAt"`
	Used       bool      `json:"used" gorm:"default:false"`
	Available  bool      `json:"available" gorm:"default:false"`
	Verify     bool      `json:"verify" gorm:"default:false"`
	Notify     bool      `json:"notify" gorm:"default:false"`
	// Unique constraint on (uid, referrer_id)
	// ReferralUserUIDReferrerIDKey is the unique constraint on (uid, referrer_id)
}

func (Referral) TableName() string {
	return "referral"
}

func (ReferralReward) TableName() string {
	return "referral_reward"
}

/*
create type reward_type_enum as enum ('ONE_MONTH_HOBBY_LICENSE', 'NEW_REWARD_TYPE');

alter type reward_type_enum owner to sealos;
*/
type ReferralReward struct {
	ID         uuid.UUID      `json:"id" gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ReferralID uuid.UUID      `json:"referralID" gorm:"type:uuid;not null;column:referral_id"`
	Reward     RewardTypeEnum `json:"reward" gorm:"type:reward_type_enum;not null"` // reward_type_enum 枚举类型已更新
	CreatedAt  time.Time      `json:"createdAt" gorm:"default:current_timestamp()"`
	UpdatedAt  time.Time      `json:"updatedAt"`
}

type RewardTypeEnum string

const (
	ONE_MONTH_HOBBY_LICENSE RewardTypeEnum = "ONE_MONTH_HOBBY_LICENSE"
)
