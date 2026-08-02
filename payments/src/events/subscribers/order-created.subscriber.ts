import { Message } from 'amqplib';
import { Subscriber, OrderCreatedEvent, Queues, RoutingKeys, getRetryCount, Exchanges } from '@tyagi-s/common';

import { Order } from '../../models/order.model';

export class OrderCreatedSubscriber extends Subscriber<OrderCreatedEvent> {
  readonly queue = Queues.PaymentsServiceOrderCreated;
  readonly routingKey = RoutingKeys.OrderCreated;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    try {
      await Order.create({
        _id: data.id,
        userId: data.userId,
        status: data.status,
        price: data.ticket.price,
      });

      this.channel.ack(msg);
    } catch (err) {
      const retryCount = getRetryCount(msg);

      if (retryCount >= 3) {
        this.channel.publish(Exchanges.Final, RoutingKeys.OrderFailed, msg.content);
        this.channel.ack(msg);

        console.log(`Failed to create order in payments service. Retried limit reached to ${retryCount}`);

        return;
      }

      this.channel.publish(Exchanges.Retry, RoutingKeys.OrderRetried, msg.content);
      this.channel.ack(msg);

      err instanceof Error && console.log(`${err.message}. Retried ${retryCount} times`);
    }
  }
}
