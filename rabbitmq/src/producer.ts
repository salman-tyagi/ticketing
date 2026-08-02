import amqp, { Channel, ChannelModel } from 'amqplib';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

async function producer() {
  const connection = await amqp.connect('amqp://localhost:5672');
  const channel = await connection.createChannel();

  const publisher = new TicketCreatedPublisher(channel);
  publisher.publish({ id: '123', title: 'Concrete', price: '123' });

  setTimeout(() => {
    connection.close();
    process.exit(0);
  }, 500);

  process.on('SIGINT', () => connection.close());
  process.on('SIGTERM', () => connection.close());
}

producer();
