import { Subscriber, OrderExpirationEvent, Queues, RoutingKeys, OrderStatus, NotFoundException } from '@tyagi-s/common';
import { Message } from 'amqplib';

import { Order } from '../../models/order.model';
import { OrderCancelledPublisher } from '../publishers/order-cancelled.publisher';

export class ExpirationCompleteSubscriber extends Subscriber<OrderExpirationEvent> {
  readonly queue = Queues.OrdersServiceExpirationComplete;
  readonly routingKey = RoutingKeys.ExpirationComplete;

  async onMessage(data: OrderExpirationEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId).populate<{ ticket: { id: string } }>('ticket');

    if (!order) throw NotFoundException('Failed to update expired order. Order not found');

    if (order.status === OrderStatus.Completed) {
      this.channel.ack(msg);
      return;
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(this.channel).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });

    this.channel.ack(msg);
  }
}
