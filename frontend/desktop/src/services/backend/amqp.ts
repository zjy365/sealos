import assert from 'assert';
import { promises as fs } from 'fs';
import { BrokerAsPromised, BrokerConfig } from 'rascal';

const EXCHANGE_NAME = 'rcc_event_exchange';

interface AmqpTlsOptions {
  cert?: string; // client cert
  key?: string; // client key
  passphrase?: string; // passphrase for key
  ca?: string; // trusted CA certs
}

export class AmqpClient {
  private broker: BrokerAsPromised | null = null;

  constructor() {}

  async connect(url?: string, tlsOptions?: AmqpTlsOptions) {
    if (!url) {
      if (!process.env.RABBITMQ_URL) {
        throw new Error('env RABBITMQ_URL is not set');
      }
      url = process.env.RABBITMQ_URL;
    }

    let socketOptions: any = {
      timeout: 10000
    };

    if (url.includes('amqps://')) {
      let certPath = tlsOptions?.cert || process.env.RABBITMQ_CERT;
      let keyPath = tlsOptions?.key || process.env.RABBITMQ_KEY;
      let caPath = tlsOptions?.ca || process.env.RABBITMQ_CA;

      let cert = certPath ? await fs.readFile(certPath) : undefined;
      let key = keyPath ? await fs.readFile(keyPath) : undefined;
      let passphrase = (tlsOptions?.passphrase || process.env.RABBITMQ_PASSPHRASE) ?? undefined;
      let ca = caPath ? [await fs.readFile(caPath)] : undefined;

      socketOptions = {
        timeout: 10000,
        cert,
        key,
        passphrase,
        ca
      };
    }

    const config: BrokerConfig = {
      vhosts: {
        '/': {
          connection: {
            url,
            retry: {
              min: 1000,
              max: 60000,
              factor: 2,
              strategy: 'exponential'
            },
            options: {
              heartbeat: 30
            },
            socketOptions
          },
          exchanges: [
            {
              name: EXCHANGE_NAME,
              assert: false,
              check: true
            }
          ],
          publications: {
            userSignup: {
              exchange: EXCHANGE_NAME,
              routingKey: 'rcc.v1.user.signup'
            },
            userSignin: {
              exchange: EXCHANGE_NAME,
              routingKey: 'rcc.v1.user.signin'
            }
          }
        }
      }
    };

    this.broker = await BrokerAsPromised.create(config);

    this.broker.on('error', (err) => {
      console.error('Broker error:', err);
    });
  }

  async disconnect() {
    if (this.broker) {
      await this.broker.shutdown();
      this.broker = null;
    }
  }

  async publishToExchange(name: string, message: any) {
    if (!this.broker) {
      await this.connect(process.env.RABBITMQ_URL);
    }
    assert(this.broker !== null, 'AMQP broker is not initialized');

    let publication = await this.broker.publish(name, message);
    publication.on('error', (err) => {
      console.error('Publish error', err);
    });
  }
}

const amqpClient = new AmqpClient();

type UserSignupEvent = {
  referral_type?: 'agency' | 'rcc';
  referral_code?: string;
  uid: string;
  email: string;
  firstname?: string;
  lastname?: string;
};

export async function sendUserSignupEvent(event: UserSignupEvent) {
  try {
    await amqpClient.publishToExchange('userSignup', {
      ...event
    });
  } catch (error) {
    console.error('Send user signup event error', error);
  }
}

export async function sendUserSigninEvent(uid: string) {
  // await amqpClient.publishToExchange('userSignin', {
  //   uid
  // });
}
