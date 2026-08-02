import { Subscriber, PaymentCreatedEvent, Queues, RoutingKeys, NotFoundException, OrderStatus } from '@tyagi-s/common';
import { Message } from 'amqplib';
import { Order } from '../../models/order.model';

export class PaymentCreatedSubscriber extends Subscriber<PaymentCreatedEvent> {
  readonly queue = Queues.OrdersServicePaymentCreated;
  readonly routingKey = RoutingKeys.PaymentCreated;

  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) throw NotFoundException('Failed to update order. Order not found');

    order.status = OrderStatus.Completed;
    await order.save();

    this.channel.ack(msg);
  }
}
