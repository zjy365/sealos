package api

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/labring/sealos/service/account/dao"
	"github.com/labring/sealos/service/account/helper"
)

// @Summary Get Order Info
// @Description Get Order Info
// @Tags Payment
// @Accept json
// @Produce json
// @Param req body OrderOperationReq true "OrderOperationReq"
// @Success 200 {object} OrderOperationResp
// @Router /payment/v1alpha1/order [post]
func GetOrderInfo(c *gin.Context) {
	req, err := helper.ParseOrderOperationReq(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprint("failed to parse request: ", err)})
		return
	}
	if err := authenticateRequest(c, req); err != nil {
		c.JSON(http.StatusUnauthorized, helper.ErrorMessage{Error: fmt.Sprintf("authenticate error : %v", err)})
		return
	}
	if req.TradeNo == "" {
		c.JSON(http.StatusBadRequest, helper.ErrorMessage{Error: "empty trade no"})
		return
	}
	order, err := dao.DBClient.GetCockroach().GetPaymentOrderWithTradeNo(req.TradeNo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, helper.ErrorMessage{Error: fmt.Sprintf("failed to get payment order: %v", err)})
		return
	}
	if order.ID == "" {
		c.JSON(http.StatusNotFound, helper.ErrorMessage{Error: "payment order not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"status":  order.Status,
		"success": true,
	})
}
