import { Subscriber, OrderCreatedEvent, Queues, Exchanges, RoutingKeys } from '@tyagi-s/common';
import { Message } from 'amqplib';

import { expirationQueue } from '../queues/expiration.queue';

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly queue = Queues.ExpirationServiceOrderCreated;
  readonly routingKey = RoutingKeys.OrderCreated;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Option: 1 => Publish an event to the delay exchange with configured dead letter

    // Options: 2 => Use BullMQ to schedule events after specific interval of time
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        delay: 60_000,
      },
    );

    this.channel.ack(msg);
  }
}
