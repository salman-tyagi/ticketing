import { Subscriber, OrderCancelledEvent, Queues, RoutingKeys, NotFoundException } from '@tyagi-s/common';
import { Message } from 'amqplib';
import { Ticket } from '../../models/ticket-model';
import { TicketUpdatedPublisher } from '../publishers/ticket.updated.publisher';

export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
  readonly queue = Queues.TicketsServiceOrderCancelled;
  readonly routingKey = RoutingKeys.OrderCancelled;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    // Find the ticket whose order is cancelled
    const ticket = await Ticket.findById(data.ticket.id);

    // If not found throw error
    if (!ticket) throw NotFoundException('Ticket not found');

    // Remove the order id from the ticket
    ticket.orderId = undefined;
    await ticket.save();

    // Publish a ticket updated event
    new TicketUpdatedPublisher(this.channel).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId.toHexString(),
      version: ticket.version,
    });

    // Ack the message
    this.channel.ack(msg);
  }
}
