import { Subscriber, TicketUpdatedEvent, RoutingKeys, Queues, NotFoundException } from '@tyagi-s/common';
import { Message } from 'amqplib';

import { Ticket } from '../../models/ticket.model';

export class TicketUpdatedSubscriber extends Subscriber<TicketUpdatedEvent> {
  readonly queue = Queues.OrdersServiceTicketUpdated;
  readonly routingKey = RoutingKeys.TicketUpdated;

  async onMessage(data: TicketUpdatedEvent['data'], message: Message) {
    // const ticket = await Ticket.findByEvent(data);
    // const _ticket = await Ticket.findById(data.id);

    // console.log({ data, ticket, _ticket });

    // if (!ticket) throw NotFoundException('Failed to update. Ticket not found');

    // const updateOptions = {
    //   title: data.title,
    //   price: data.price,
    // } as TicketUpdatedEvent['data'];

    // ticket.set(updateOptions);
    // await ticket.save({ validateModifiedOnly: true });

    // The version is set explicitly from the event rather than letting the
    // document increment it on save. This replica only stores title/price, so
    // an event that changed nothing else (e.g. the tickets service setting or
    // clearing orderId) would otherwise be a no-op save that leaves the
    // version behind and makes every later event fail to match.
    const ticket = await Ticket.findOneAndUpdate(
      { _id: data.id, version: data.version - 1 },
      { $set: { title: data.title, price: data.price, version: data.version } },
      { returnDocument: 'after' },
    );

    if (!ticket) throw NotFoundException('Failed to update. Ticket not found');

    this.channel.ack(message);
  }
}
