import { amqpClient } from './amqp';

const EXCHANGE_NAME = 'rcc_event_exchange';

export async function sendCreateTemplateEvent(uid: string) {
  await amqpClient.publishToExchange(EXCHANGE_NAME, 'rcc.v1.user.create_template', {
    uid
  });
}
