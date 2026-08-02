import { Message } from 'amqplib';
import mongoose from 'mongoose';

import { Ticket } from '../../../models/ticket-model';
import { OrderCreatedSubscriber } from '../order-created.subscriber';
import { channel } from '../../../rabbitmq';
import { OrderCreatedEvent, OrderStatus } from '@tyagi-s/common';

async function setup() {
  // Create a fake subscriber object
  const subscriber = new OrderCreatedSubscriber(channel);

  // Create an ticket
  const ticket = await Ticket.create({
    title: 'Concert',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  // Create a dummy data object
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    userId: 'fd8s7f98ds7f',
    status: OrderStatus.Created,
    expiresAt: '54545',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  // Create a dummy message object
  const msg = {} as Message;

  // Return all
  return { subscriber, ticket, data, msg };
}

it('should throw ticket not found error on subscribing the order created event if ticket is not found', async () => {
  const { subscriber, data, msg, ticket } = await setup();
  data.ticket.id = '45454545';

  await expect(subscriber.onMessage(data, msg)).rejects.toThrow();
});

it('should update the ticket with order id', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.orderId?.toString()).toEqual(data.id);
});

it('should acknowledge the event/message on success order created event subscribe', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.publish).toHaveBeenCalled();

  const updatedTicketData = JSON.parse((channel.publish as jest.Mock).mock.calls[0].at(2).toString());

  expect(updatedTicketData.orderId).toEqual(data.id);
});
