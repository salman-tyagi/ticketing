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

      await channel.assertExchange(Exchanges.Ticket, 'direct', {
        durable: true,
      });

      await channel.assertExchange(Exchanges.Expiration, 'direct', {
        durable: true,
      });

      await channel.assertExchange(Exchanges.Payment, 'direct', {
        durable: true,
      });

      await channel.assertQueue(Queues.OrdersServiceTicketCreated, {
        durable: true,
      });

      await channel.assertQueue(Queues.OrdersServiceTicketUpdated, {
        durable: true,
      });

      await channel.assertQueue(Queues.OrdersServiceExpirationComplete, {
        durable: true,
      });

      await channel.assertQueue(Queues.OrdersServicePaymentCreated, {
        durable: true,
      });

      await channel.bindQueue(Queues.OrdersServiceTicketCreated, Exchanges.Ticket, RoutingKeys.TicketCreated);
      await channel.bindQueue(Queues.OrdersServiceTicketUpdated, Exchanges.Ticket, RoutingKeys.TicketUpdated);
      await channel.bindQueue(
        Queues.OrdersServiceExpirationComplete,
        Exchanges.Expiration,
        RoutingKeys.ExpirationComplete,
      );
      await channel.bindQueue(Queues.OrdersServicePaymentCreated, Exchanges.Payment, RoutingKeys.PaymentCreated);

      console.log('RabbitMQ connected');

      connection.on('error', err => {
        console.log('RabbitMQ connection error:', err.message);
      });

      connection.on('close', () => {
        if (shuttingDown) return;
        console.log('RabbitMQ disconnected, reconnecting...');
        connectRabbitMQ();
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
