import { Publisher, OrderCreatedEvent, Exchanges, RoutingKeys } from '@tyagi-s/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly exchange = Exchanges.Order;
  readonly routingKey = RoutingKeys.OrderCreated;
}
