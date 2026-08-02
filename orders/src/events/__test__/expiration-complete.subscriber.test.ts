import { Message } from 'amqplib';
import mongoose from 'mongoose';
import { OrderExpirationEvent, OrderStatus } from '@tyagi-s/common';

import { channel } from '../../__mocks__/rabbitmq';
import { Order } from '../../models/order.model';
import { Ticket } from '../../models/ticket.model';
import { ExpirationCompleteSubscriber } from '../subscribers/expiration-complete.subscriber';

const setup = async () => {
  const subscriber = new ExpirationCompleteSubscriber(channel);

  const ticket = await Ticket.create({
    title: 'concert',
    price: 100,
  });

  const order = await Order.create({
    userId: new mongoose.Types.ObjectId(),
    ticket: ticket.id,
  });

  const data: OrderExpirationEvent['data'] = {
    orderId: order.id,
  };

  const msg = {} as Message;

  return { subscriber, ticket, order, data, msg };
};

it('throws failed to update order if order not found by order id', async () => {
  const { subscriber, data, msg, ticket, order } = await setup();

  data.orderId = new mongoose.Types.ObjectId().toHexString();

  await expect(subscriber.onMessage(data, msg)).rejects.toThrow();
});

it('updates the order status to cancelled', async () => {
  const { subscriber, data, msg, ticket, order } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it('publishes the order cancelled event', async () => {
  const { subscriber, data, msg, ticket, order } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.publish).toHaveBeenCalled();

  const eventData = JSON.parse((channel.publish as jest.Mock).mock.calls[0][2].toString());

  expect(eventData.id).toEqual(order.id);
});

it('acknowledges the message', async () => {
  const { subscriber, data, msg, ticket, order } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});
