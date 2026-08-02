import { Message } from 'amqplib';
import { TicketUpdatedEvent } from '@tyagi-s/common';

import { channel } from '../../rabbitmq';
import { Ticket } from '../../models/ticket.model';
import { TicketUpdatedSubscriber } from '../subscribers/ticket-updated.subscriber';

async function setup() {
  // Create ticket updated event instance
  const subscriber = new TicketUpdatedSubscriber(channel);

  // Create a ticket
  const ticket = await Ticket.create({
    title: 'concert',
    price: 100,
  });

  // Create fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'new concert',
    price: 999,
    userId: 'df7s6f78ds6',
  };

  // Create fake message object
  const msg = {} as Message;

  // return all
  return { subscriber, ticket, data, msg };
}

it('should find, update and save a ticket', async () => {
  const { subscriber, ticket, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket?.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it('should acknowledge the message', async () => {
  const { subscriber, data, msg } = await setup();

  await subscriber.onMessage(data, msg);

  expect(channel.ack).toHaveBeenCalled();
});

it('should advance the version when an event changes nothing this replica stores', async () => {
  const { subscriber, ticket, msg } = await setup();

  // Reproduces the reservation flow: the tickets service sets orderId and then
  // clears it on expiry, leaving title/price untouched. This replica does not
  // store orderId, so neither event changes anything here — but the version
  // still has to advance, or the second event no longer matches.
  const reserved: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: ticket.title,
    price: ticket.price,
    userId: 'df7s6f78ds6',
    orderId: '6512c5f1e4b0a2d3c4b5a6f7',
  };

  await subscriber.onMessage(reserved, msg);

  expect((await Ticket.findById(ticket.id))?.version).toEqual(reserved.version);

  // Order expires, tickets service clears orderId and emits the next version.
  const released: TicketUpdatedEvent['data'] = { ...reserved, version: reserved.version + 1 };
  delete released.orderId;

  await subscriber.onMessage(released, msg);

  expect((await Ticket.findById(ticket.id))?.version).toEqual(released.version);
});

it('should not acknowledge the ticket if skipped version is captured', async () => {
  const { subscriber, data, msg, ticket } = await setup();

  data.version = 10;

  try {
    await subscriber.onMessage(data, msg);
  } catch {}

  expect(channel.ack).not.toHaveBeenCalled();
});
