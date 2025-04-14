import { amqpClient } from './amqp';

const EXCHANGE_NAME = 'rcc_event_exchange';

type UserSignupEvent = {
  referral_code?: string;
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
};

export async function sendUserSignupEvent(event: UserSignupEvent) {
  await amqpClient.publishToExchange(EXCHANGE_NAME, 'rcc.v1.user.signup', {
    ...event
  });
}

export async function sendUserSigninEvent(uid: string) {
  await amqpClient.publishToExchange(EXCHANGE_NAME, 'rcc.v1.user.signin', {
    uid
  });
}
