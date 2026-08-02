import { Subscriber, OrderCreatedEvent, Queues, RoutingKeys, NotFoundException, getRetryCount } from '@tyagi-s/common';
import { Message } from 'amqplib';
import mongoose from 'mongoose';

import { Ticket } from '../../models/ticket-model';
import { TicketUpdatedPublisher } from '../publishers/ticket.updated.publisher';
export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly queue = Queues.TicketsServiceOrderCreated;
  readonly routingKey = RoutingKeys.OrderCreated;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find ticket that is being reserved for order
    const ticket = await Ticket.findById(data.ticket.id);

    // If not found, throw error
    if (!ticket) throw NotFoundException('Ticket not found');

    // Update the orderId in the ticket
    ticket.orderId = new mongoose.Types.ObjectId(data.id);
    await ticket.save();

    // Publish ticket updated event
    new TicketUpdatedPublisher(this.channel).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId.toHexString(),
      orderId: ticket.orderId.toHexString(),
      version: ticket.version,
    });

    // Ack the message
    this.channel.ack(msg);
  }
}
