import amqp, { ChannelModel, Channel } from 'amqplib';
import assert from 'assert';

export class AmqpClient {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor() {}

  async connect(url?: string) {
    try {
      if (!url) {
        if (!process.env.RABBITMQ_URL) {
          throw new Error('env RABBITMQ_URL is not set');
        }
        url = process.env.RABBITMQ_URL;
      }

      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();

      // Handle connection close
      this.connection.on('close', () => {
        this.connection = null;
        this.channel = null;
      });

      return true;
    } catch (error) {
      console.error('Failed to connect to AMQP:', error);
      return false;
    }
  }

  async disconnect() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.channel = null;
      this.connection = null;
    } catch (error) {
      console.error('Error disconnecting from AMQP:', error);
    }
  }

  getChannel(): Channel | null {
    return this.channel;
  }

  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  async sendToQueue(queue: string, message: any) {
    if (!this.isConnected()) {
      if (!(await this.connect(process.env.RABBITMQ_URL))) {
        return false;
      }
    }
    assert(
      this.connection !== null && this.channel !== null,
      'AMQP connection or channel is not initialized'
    );

    let channel = this.channel;

    // assert queue
    await channel.assertQueue(queue, {
      durable: true
    });

    return channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true
    });
  }

  async consumeFromQueue(queue: string, callback: (message: any) => void) {
    if (!this.isConnected()) {
      if (!(await this.connect(process.env.RABBITMQ_URL))) {
        return false;
      }
    }
    assert(
      this.connection !== null && this.channel !== null,
      'AMQP connection or channel is not initialized'
    );

    let channel = this.channel;

    // assert queue
    await channel.assertQueue(queue, {
      durable: true
    });

    channel.consume(
      queue,
      (message) => {
        if (message) {
          callback(JSON.parse(message.content.toString()));
          channel.ack(message);
        }
      },
      {
        noAck: false
      }
    );
    return true;
  }

  async publishToExchange(exchange: string, routingKey: string, message: any) {
    if (!this.isConnected()) {
      if (!(await this.connect(process.env.RABBITMQ_URL))) {
        return false;
      }
    }
    assert(
      this.connection !== null && this.channel !== null,
      'AMQP connection or channel is not initialized'
    );

    let channel = this.channel;

    // assert alternate exchange
    await channel.assertExchange(`${exchange}_alt`, 'topic', {
      durable: true
    });

    // assert exchange
    await channel.assertExchange(exchange, 'topic', {
      durable: true,
      alternateExchange: 'alt_exchange'
    });

    return channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)));
  }

  async consumeFromExchange(
    exchange: string,
    routingKey: string,
    clientId: string,
    callback: (message: any) => void
  ) {
    if (!this.isConnected()) {
      if (!(await this.connect(process.env.RABBITMQ_URL))) {
        return false;
      }
    }
    assert(
      this.connection !== null && this.channel !== null,
      'AMQP connection or channel is not initialized'
    );

    let channel = this.channel;

    // assert exchange
    await channel.assertExchange(exchange, 'topic', {
      durable: true
    });

    // assert anonymous queue for binding
    const { queue: queueName } = await channel.assertQueue(`${exchange}_${clientId}`, {
      durable: true
    });

    // bind queue to exchange
    await channel.bindQueue(queueName, exchange, routingKey);

    return channel.consume(
      queueName,
      (message) => {
        if (message) {
          callback(JSON.parse(message.content.toString()));
          channel.ack(message);
        }
      },
      {
        noAck: false
      }
    );
  }
}

export const amqpClient = new AmqpClient();
