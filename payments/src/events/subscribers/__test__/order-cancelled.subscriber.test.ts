import mongoose from 'mongoose';
import { Message } from 'amqplib';

import { OrderCancelledEvent, OrderStatus } from '@tyagi-s/common';
import { OrderCancelledSubscriber } from '../order-cancelled.subscriber';
import { channel } from '../../../rabbitmq';
import { Order } from '../../../models/order.model';

const setup = async () => {
  const subscriber = new OrderCancelledSubscriber(channel);

  const order = await Order.create({
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 100,
  });

  const data: OrderCancelledEvent['data'] = {
    id: order.id,
    version: order.version,
    ticket: {
      id: '6767867867868768',
    },
  };

  const msg = {} as Message;

  return { subscriber, order, data, msg };
};

it('throws error on order not found', async () => {
  const { subscriber, data, msg, order } = await setup();

  data.id = new mongoose.Types.ObjectId().toHexString();

  await expect(subscriber.onMessage(data, msg)).rejects.toThrow();
});

it('updated the order status to cancelled', async () => {
  const { subscriber, data, msg, order } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('acknowledges the message', async () => {
  const { subscriber, data, msg, order } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});
