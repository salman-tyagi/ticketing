import mongoose from 'mongoose';
import { Message } from 'amqplib';
import {
  Subscriber,
  OrderCancelledEvent,
  Queues,
  RoutingKeys,
  NotFoundException,
  OrderStatus,
  getRetryCount,
  Exchanges,
} from '@tyagi-s/common';
import { Order } from '../../models/order.model';

export class OrderCancelledSubscriber extends Subscriber<OrderCancelledEvent> {
  readonly queue = Queues.PaymentsServiceOrderCancelled;
  readonly routingKey = RoutingKeys.OrderCancelled;

  async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
    try {
      const order = await Order.findById(data.id);

      if (!order) throw NotFoundException('Order not found');

      order.status = OrderStatus.Cancelled;
      await order.save();

      this.channel.ack(msg);
    } catch (err) {
      console.log('Failed to cancel the order in payments service.', err);

      const retryCount = getRetryCount(msg);

      if (retryCount >= 3) {
        this.channel.publish(Exchanges.Final, RoutingKeys.OrderFailed, msg.content);
        this.channel.ack(msg);
      }

      this.channel.publish(Exchanges.Retry, RoutingKeys.OrderRetried, msg.content);
      this.channel.ack(msg);
    }
  }
}
