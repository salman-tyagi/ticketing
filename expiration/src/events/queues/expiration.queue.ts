import Queue from 'bull';

import { ExpirationCompletePublisher } from '../publishers/expiration-complete.publisher';
import { channel } from '../../rabbitmq';

interface Payload {
  orderId: string;
}

export const expirationQueue = new Queue<Payload>('order:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(job => {
  new ExpirationCompletePublisher(channel).publish({ orderId: job.data.orderId });
});
