import { Subscriber, OrderCreatedEvent, OrderStatus } from '@tyagi-s/common';
import { Message } from 'amqplib';
import { OrderCreatedSubscriber } from '../subscribers/order-created.subscriber';
import { channel } from '../../rabbitmq';

const setup = async () => {
  const subscriber = new OrderCreatedSubscriber(channel);

  const data: OrderCreatedEvent['data'] = {
    id: 'fd67sf678ds6f',
    userId: '78789798',
    version: 0,
    status: OrderStatus.Created,
    expiresAt: '87897897',
    ticket: {
      id: '7897897897',
      price: 100,
    },
  };

  const msg = {} as Message;

  return { subscriber, data, msg };
};

it('ack the message', async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});

it('publishes expiration complete event', async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.publish).toHaveBeenCalled();
});
