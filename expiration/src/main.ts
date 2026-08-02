import { OrderCreatedSubscriber } from './events/subscribers/order-created.subscriber';
import { channel, connectRabbitMQ } from './rabbitmq';

(async function main() {
  try {
    if (!process.env.RABBITMQ_URL) throw Error('RABBITMQ_URL is not defined');

    await connectRabbitMQ();

    new OrderCreatedSubscriber(channel).consume();
  } catch (err) {
    console.log('[MAIN_ERROR]:', err);
    process.exit(1);
  }
})();
