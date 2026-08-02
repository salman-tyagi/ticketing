import amqp, { Channel, ChannelModel } from 'amqplib';
import { RoutingKeys, Exchanges, Queues } from '@tyagi-s/common';

export let channel: Channel, connection: ChannelModel;

const RETRY_DELAY = 5000;

let shuttingDown = false;

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function connectRabbitMQ() {
  while (!shuttingDown) {
    try {
      connection = await amqp.connect(process.env.RABBITMQ_URL!);
      channel = await connection.createChannel();

      await channel.assertExchange(Exchanges.Order, 'direct', {
        durable: true,
      });

      await channel.assertQueue(Queues.ExpirationServiceOrderCreated, {
        durable: true,
      });

      await channel.bindQueue(Queues.ExpirationServiceOrderCreated, Exchanges.Order, RoutingKeys.OrderCreated);

      console.log('RabbitMQ connected');

      connection.on('error', err => {
        console.log('RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        if (shuttingDown) return;
        console.log('RabbitMQ connection closed');
      });

      return;
    } catch (err) {
      console.log(`RabbitMQ unavailable, retrying in ${RETRY_DELAY}ms:`, (err as Error).message);
      await wait(RETRY_DELAY);
    }
  }
}

function closeRabbitMQ() {
  shuttingDown = true;
  connection?.close();
}

process.on('SIGINT', closeRabbitMQ);
process.on('SIGTERM', closeRabbitMQ);
