package utils

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
	ctrl "sigs.k8s.io/controller-runtime"
)

var (
	logger = ctrl.Log.WithName("amqp")
)

const (
	UserBilling = "rcc.v1.user.billing"
	RetryTimes  = 3
)

type AMQPConfig struct {
	URL       string
	Exchange  string
	TLSConfig *tls.Config
}

type AMQP struct {
	conn     *amqp.Connection
	channel  *amqp.Channel
	exchange string
}

type BillingEvent struct {
	ID        string `json:"id"`
	UID       string `json:"uid"`
	Kind      string `json:"kind"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	PaymentID string `json:"payment_id"`
}

func NewAMQP(config *AMQPConfig) (*AMQP, error) {
	conn, err := amqp.DialTLS(config.URL, config.TLSConfig)
	if err != nil {
		return nil, err
	}
	ch, err := conn.Channel()
	if err != nil {
		return nil, err
	}
	return &AMQP{conn: conn, channel: ch, exchange: config.Exchange}, nil
}

func (a *AMQP) recreateChannel() error {
	ch, err := a.conn.Channel()
	if err != nil {
		return err
	}
	a.channel = ch
	return nil
}

func (a *AMQP) PublishBillingEvent(ctx context.Context, billing *BillingEvent) error {
	body, err := json.Marshal(billing)
	if err != nil {
		return err
	}
	for range RetryTimes {
		if err := a.channel.PublishWithContext(ctx, a.exchange, UserBilling, false, false, amqp.Publishing{
			ContentType: "application/json",
			Body:        body,
		}); err != nil {
			logger.Error(err, "publish billing event failed")
			if err == amqp.ErrClosed {
				time.Sleep(time.Second * 5)
				if err := a.recreateChannel(); err != nil {
					logger.Error(err, "recreate channel failed")
				}
				continue
			}
			return err
		}
		break
	}
	return nil
}

func (a *AMQP) Close() error {
	a.channel.Close()
	return a.conn.Close()
}
