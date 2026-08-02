import { Message } from 'amqplib';
import { OrderCreatedEvent, OrderStatus } from '@tyagi-s/common';
import mongoose from 'mongoose';

import { OrderCreatedSubscriber } from '../order-created.subscriber';
import { channel } from '../../../rabbitmq';
import { Order } from '../../../models/order.model';

it('creates an order and acks the message', async () => {
  const subscriber = new OrderCreatedSubscriber(channel);

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date().toISOString(),
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
      price: 100,
    },
  };

  const msg = {} as Message;

  await subscriber.onMessage(data, msg);

  const order = await Order.findById(data.id);

  expect(order?.id).toEqual(data.id);
  expect(channel.ack).toHaveBeenCalled();
});
