package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/alipay/global-open-sdk-go/com/alipay/api/model"
	"github.com/alipay/global-open-sdk-go/com/alipay/api/request/auth"
	responseAuth "github.com/alipay/global-open-sdk-go/com/alipay/api/response/auth"
	responsePay "github.com/alipay/global-open-sdk-go/com/alipay/api/response/pay"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/labring/sealos/controllers/pkg/types"
	"github.com/labring/sealos/service/account/dao"
	"github.com/labring/sealos/service/account/helper"
	services "github.com/labring/sealos/service/pkg/pay"
	"github.com/sirupsen/logrus"
)

func AlipayAuthNotify(c *gin.Context) {
	requestInfo := requestInfoStruct{
		Path:         c.Request.RequestURI,
		Method:       c.Request.Method,
		ResponseTime: c.GetHeader("request-time"),
		ClientID:     c.GetHeader("client-id"),
		Signature:    c.GetHeader("signature"),
	}

	var err error
	requestInfo.Body, err = c.GetRawData()
	if err != nil {
		logrus.Errorf("Failed to get raw data: %v", err)
		sendError(c, http.StatusBadRequest, "failed to get raw data", err)
		return
	}

	if ok, err := dao.PaymentService.CheckRspSign(
		requestInfo.Path,
		requestInfo.Method,
		requestInfo.ClientID,
		requestInfo.ResponseTime,
		string(requestInfo.Body),
		requestInfo.Signature,
	); err != nil {
		logrus.Errorf("Failed to check response sign: %v", err)
		logrus.Errorf("Path: %s\n Method: %s\n ClientID: %s\n ResponseTime: %s\n Body: %s\n Signature: %s", requestInfo.Path, requestInfo.Method, requestInfo.ClientID, requestInfo.ResponseTime, string(requestInfo.Body), requestInfo.Signature)
		sendError(c, http.StatusUnauthorized, "failed to check response sign", err)
		return
	} else if !ok {
		logrus.Errorf("Check signature fail")
		sendError(c, http.StatusBadRequest, "check signature fail", nil)
		return
	}

	var notification types.AuthCodeNotification

	if err := json.Unmarshal(requestInfo.Body, &notification); err != nil {
		logrus.Errorf("Failed to unmarshal notification: %v", err)
		sendError(c, http.StatusBadRequest, "failed to unmarshal notification", err)
		return
	}

	if notification.AuthorizationNotifyType == "TOKEN_CANCELED" {
		logrus.Infof("get token cancelled: %v", notification)
		sendSuccessResponse(c)
		return
	}

	if notification.AuthorizationNotifyType != "AUTHCODE_CREATED" {
		logrus.Errorf("get auth notification type is not AUTHCODE_CREATED: %v", notification)
		sendError(c, http.StatusInternalServerError, "failed to auth", fmt.Errorf("get error auth notification type: %v", notification.AuthorizationNotifyType))
		return
	}

	var order types.PaymentOrder
	// 移除头部的rcc-前缀
	tradeNo := notification.AuthState[4:]
	if err := dao.DBClient.GetGlobalDB().Model(&types.PaymentOrder{}).Where(types.PaymentOrder{PaymentRaw: types.PaymentRaw{TradeNO: tradeNo}}).Find(&order).Error; err != nil {
		logrus.Errorf("failed to get payment order when auth notify: %v", err)
		sendError(c, http.StatusInternalServerError, "failed to get payment order", err)
		return
	}

	if order.Status == "SUCCESS" {
		logrus.Infof("order already success: %v", notification)
		sendSuccessResponse(c)
		return
	}
	request, authApplyTokenRequest := auth.NewAlipayAuthApplyTokenRequest()
	authApplyTokenRequest.GrantType = model.GrantTypeAUTHORIZATION_CODE
	authApplyTokenRequest.CustomerBelongsTo = model.CustomerBelongsTo(order.Method)
	authApplyTokenRequest.AuthCode = notification.AuthCode

	execute, err := dao.PaymentService.Client.Execute(request)
	if err != nil {
		logrus.Errorf("Failed to execute auth apply token request: %v", err)
		sendError(c, http.StatusInternalServerError, "failed to execute auth apply token request", err)
		return
	}
	response := execute.(*responseAuth.AlipayAuthApplyTokenResponse)

	if response.Result.ResultStatus != "S" || response.Result.ResultCode != "SUCCESS" {
		sendError(c, http.StatusInternalServerError, "failed to get access token", nil)
		return
	}

	card := types.CardInfo{
		ID:        uuid.New(),
		UserUID:   order.UserUID,
		CardNo:    response.UserLoginId,
		CardBrand: order.Method,
		CardToken: response.AccessToken,
	}

	cardID, err := dao.DBClient.SetCardInfo(&card)
	if err != nil {
		sendError(c, http.StatusInternalServerError, "failed to save card info", err)
		return
	}
	// save card it to payment order
	if err = dao.DBClient.GetGlobalDB().Model(&types.PaymentOrder{}).Where(types.PaymentOrder{PaymentRaw: types.PaymentRaw{TradeNO: tradeNo}}).Update("card_uid", cardID).Error; err != nil {
		logrus.Errorf("failed to set payment order card id when auth notify: %v", err)
		sendError(c, http.StatusInternalServerError, "failed to set payment order card id", err)
		return
	}
	var goodsID string
	if order.Type == types.PaymentTypeAccountRecharge {
		goodsID = os.Getenv(helper.ENVAtomRechargeGoodsID)
	} else {
		goodsID = os.Getenv(helper.ENVAtomSubscriptionGoodsID)
	}

	paymentReq := services.PaymentRequest{
		PaymentMethod:    order.Method,
		ReferenceOrderId: order.ID,
		RequestID:        order.TradeNO,
		UserUID:          order.UserUID,
		Amount:           order.Amount,
		Currency:         dao.PaymentCurrency,
		GoodsID:          goodsID,
		UserAgent:        c.GetHeader("User-Agent"),
		ClientIP:         c.ClientIP(),
		DeviceTokenID:    c.GetHeader("Device-Token-ID"),
	}
	var paySvcResp *responsePay.AlipayPayResponse
	if order.Type == types.PaymentTypeAccountRecharge {
		paySvcResp, err = dao.PaymentService.CreatePaymentWithCard(paymentReq, &card)
	} else {
		paySvcResp, err = dao.PaymentService.CreateSubscriptionPayWithCard(paymentReq, &card)
	}
	if err != nil {
		logrus.Errorf("failed to create payment with access token: %v", err)
		sendError(c, http.StatusInternalServerError, "failed to create payment with access token", err)
		return
	}
	if (paySvcResp.Result.ResultCode == SuccessStatus && paySvcResp.Result.ResultStatus == "S") || (paySvcResp.Result.ResultCode == PaymentInProcess && paySvcResp.Result.ResultStatus == "U") {
		sendSuccessResponse(c)
		return
	}
	logrus.Errorf("payment result is not SUCCESS: %#+v", paySvcResp)
	sendError(c, http.StatusInternalServerError, "failed to pay with access token", fmt.Errorf("payment result is not SUCCESS: %#+v", paySvcResp.Result))
}
