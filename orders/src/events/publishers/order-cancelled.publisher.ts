import { Publisher, OrderCancelledEvent, Exchanges, RoutingKeys } from '@tyagi-s/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly exchange = Exchanges.Order;
  readonly routingKey = RoutingKeys.OrderCancelled;
}
