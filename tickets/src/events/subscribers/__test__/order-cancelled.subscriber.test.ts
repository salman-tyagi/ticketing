import { Message } from 'amqplib';
import mongoose from 'mongoose';

import { OrderCancelledEvent } from '@tyagi-s/common';
import { Ticket } from '../../../models/ticket-model';
import { channel } from '../../../rabbitmq';
import { OrderCancelledSubscriber } from '../order-cancelled.subscriber';

async function setup() {
  // Create a instance of order cancelled subscriber
  const subscriber = new OrderCancelledSubscriber(channel);

  const orderId = new mongoose.Types.ObjectId();

  // Create a ticket
  const ticket = await Ticket.create({
    title: 'concert',
    price: 100,
    userId: new mongoose.Types.ObjectId(),
    orderId,
  });

  // Create a dummy data event object
  const data: OrderCancelledEvent['data'] = {
    id: orderId.toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // Create a message object
  const msg = {} as Message;

  // Return all
  return { subscriber, ticket, data, msg };
}

it('throws ticket not found error on subscribing order cancelled event if ticket not found', async () => {
  const { subscriber, ticket, data, msg } = await setup();
  data.ticket.id = new mongoose.Types.ObjectId().toHexString();

  await expect(subscriber.onMessage(data, msg)).rejects.toThrow();
});

it('removes order it from the cancelled ticket', async () => {
  const { subscriber, ticket, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId).toBeUndefined();
});

it('publishes a ticket updated event on order cancelled', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.publish).toHaveBeenCalled();
});

it('acknowledges the order cancelled event', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});
