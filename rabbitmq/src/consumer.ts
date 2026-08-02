import amqp from 'amqplib';
import { TicketCreatedSubscriber } from './events/ticket-created-subscriber';

async function consumer() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  connection.on('close', () => {
    console.log('connection closed');
    process.exit(0);
  });

  process.on('SIGINT', () => connection.close());
  process.on('SIGTERM', () => connection.close());

  new TicketCreatedSubscriber(channel).consume();
}

consumer();
