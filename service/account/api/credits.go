package api

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/sirupsen/logrus"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/labring/sealos/controllers/pkg/types"
	"github.com/labring/sealos/service/account/dao"
	"github.com/labring/sealos/service/account/helper"
)

type CreditsInfoResp struct {
	UserUID uuid.UUID `json:"userUid"`

	Balance          int64 `json:"balance"`
	DeductionBalance int64 `json:"deductionBalance"`

	Credits          int64 `json:"credits"`
	DeductionCredits int64 `json:"deductionCredits"`

	KYCDeductionCreditsDeductionBalance int64 `json:"kycDeductionCreditsDeductionBalance"`
	KYCDeductionCreditsBalance          int64 `json:"kycDeductionCreditsBalance"`

	CurrentPlanCreditsBalance          int64 `json:"currentPlanCreditsBalance"`
	CurrentPlanCreditsDeductionBalance int64 `json:"currentPlanCreditsDeductionBalance"`

	BonusCreditsBalance          int64 `json:"bonusCreditsBalance"`
	BonusCreditsDeductionBalance int64 `json:"bonusCreditsDeductionBalance"`
}

type BonusDetailResp struct {
	UserUID     uuid.UUID   `json:"userUid"`
	BonusItems  []BonusItem `json:"bonusItems"`
	TotalAmount int64       `json:"totalAmount"`
	UsedAmount  int64       `json:"usedAmount"`
}

type BonusItem struct {
	ID         string    `json:"id"`
	FromID     string    `json:"fromId"`
	Amount     int64     `json:"amount"`
	UsedAmount int64     `json:"usedAmount"`
	CreatedAt  time.Time `json:"createdAt"`
	ExpiredAt  time.Time `json:"expiredAt"`
	Status     string    `json:"status"`
}

// @Summary Get credits info
// @Description Get credits info
// @Tags Credits
// @Accept json
// @Produce json
// @Param req body CreditsInfoReq true "CreditsInfoReq"
// @Success 200 {object} CreditsInfoResp
// @Router /account/v1alpha1/credits/info [post]
func GetCreditsInfo(c *gin.Context) {
	req := &helper.AuthBase{}
	if err := authenticateRequest(c, req); err != nil {
		c.JSON(http.StatusUnauthorized, helper.ErrorMessage{Error: fmt.Sprintf("authenticate error : %v", err)})
		return
	}
	creditsInfo, err := getCreditsInfo(req.UserUID)
	if err != nil {
		logrus.Errorf("GetCreditsInfo error: %v", err)
		c.JSON(http.StatusInternalServerError, helper.ErrorMessage{Error: fmt.Sprintf("failed to get credits info: %v", err)})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"credits": creditsInfo,
	})
}

func getCreditsInfo(userUID uuid.UUID) (any, error) {
	var (
		creditsInfo  CreditsInfoResp
		subscription *types.Subscription
		account      *types.Account
		err          error
		wg           sync.WaitGroup
		errChan      = make(chan error, 2)
	)

	wg.Add(1)
	go func() {
		defer wg.Done()
		subscription, err = dao.DBClient.GetSubscription(&types.UserQueryOpts{UID: userUID})
		if err != nil {
			errChan <- fmt.Errorf("failed to get subscription info: %v", err)
		}
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		account, err = dao.DBClient.GetAccount(types.UserQueryOpts{UID: userUID})
		if err != nil {
			errChan <- fmt.Errorf("failed to get account: %v", err)
		}
	}()

	wg.Wait()
	close(errChan)

	for e := range errChan {
		if e != nil {
			return nil, e
		}
	}

	currentPlan, err := dao.DBClient.GetSubscriptionPlan(subscription.PlanName)
	if err != nil {
		return nil, fmt.Errorf("failed to get subscription plan info: %v", err)
	}

	freePlan, err := dao.DBClient.GetSubscriptionPlan(types.FreeSubscriptionPlanName)
	if err != nil {
		return nil, fmt.Errorf("failed to get free plan info: %v", err)
	}

	credits, err := dao.DBClient.GetAvailableCredits(&types.UserQueryOpts{UID: userUID})
	if err != nil {
		return nil, fmt.Errorf("failed to get available credits: %v", err)
	}

	var totalCredits, totalDeductionCredits int64
	for _, c := range credits {
		totalCredits += c.Amount
		totalDeductionCredits += c.UsedAmount
	}

	creditsInfo.UserUID = userUID
	creditsInfo.Balance = account.Balance
	creditsInfo.DeductionBalance = account.DeductionBalance
	creditsInfo.Credits = totalCredits
	creditsInfo.DeductionCredits = totalDeductionCredits

	var currentCredits, freeCredits types.Credits
	for i := range credits {
		switch credits[i].FromType {
		case types.CreditsFromTypeBonus:
			creditsInfo.BonusCreditsBalance += credits[i].Amount
			creditsInfo.BonusCreditsDeductionBalance += credits[i].UsedAmount
		case types.CreditsFromTypeSubscription:
			switch credits[i].FromID {
			case currentPlan.ID.String():
				currentCredits = credits[i]
				creditsInfo.CurrentPlanCreditsBalance = currentCredits.Amount
				creditsInfo.CurrentPlanCreditsDeductionBalance = currentCredits.UsedAmount
			case freePlan.ID.String():
				freeCredits = credits[i]
				creditsInfo.KYCDeductionCreditsBalance = freeCredits.Amount
				creditsInfo.KYCDeductionCreditsDeductionBalance = freeCredits.UsedAmount
			}
		}
	}
	if subscription.PlanName == types.FreeSubscriptionPlanName {
		creditsInfo.KYCDeductionCreditsBalance = creditsInfo.CurrentPlanCreditsBalance
		creditsInfo.KYCDeductionCreditsDeductionBalance = creditsInfo.CurrentPlanCreditsDeductionBalance
	}
	return creditsInfo, nil
}

// @Summary Get bonus details
// @Description Get bonus details including amount, used amount, and creation time
// @Tags Credits
// @Accept json
// @Produce json
// @Success 200 {object} BonusDetailResp
// @Router /account/v1alpha1/credits/bonus-details [get]
func GetBonusDetails(c *gin.Context) {
	req := &helper.AuthBase{}
	if err := authenticateRequest(c, req); err != nil {
		c.JSON(http.StatusUnauthorized, helper.ErrorMessage{Error: fmt.Sprintf("authenticate error : %v", err)})
		return
	}

	bonusDetails, err := getBonusDetails(req.UserUID)
	if err != nil {
		logrus.Errorf("GetBonusDetails error: %v", err)
		c.JSON(http.StatusInternalServerError, helper.ErrorMessage{Error: fmt.Sprintf("failed to get bonus details: %v", err)})
		return
	}

	c.JSON(http.StatusOK, bonusDetails)
}

func getBonusDetails(userUID uuid.UUID) (*BonusDetailResp, error) {
	credits, err := dao.DBClient.GetAvailableCredits(&types.UserQueryOpts{UID: userUID})
	if err != nil {
		return nil, fmt.Errorf("failed to get available credits: %v", err)
	}

	resp := &BonusDetailResp{
		UserUID:    userUID,
		BonusItems: make([]BonusItem, 0),
	}

	for _, credit := range credits {
		if credit.FromType == types.CreditsFromTypeBonus {
			bonusItem := BonusItem{
				ID:         credit.ID.String(),
				FromID:     credit.FromID,
				Amount:     credit.Amount,
				UsedAmount: credit.UsedAmount,
				CreatedAt:  credit.CreatedAt,
				ExpiredAt:  credit.ExpireAt,
				Status:     string(credit.Status),
			}
			resp.BonusItems = append(resp.BonusItems, bonusItem)
			resp.TotalAmount += credit.Amount
			resp.UsedAmount += credit.UsedAmount
		}
	}

	return resp, nil
}
