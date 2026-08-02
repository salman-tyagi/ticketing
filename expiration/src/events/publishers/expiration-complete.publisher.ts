import { Publisher, OrderExpirationEvent, Exchanges, RoutingKeys } from '@tyagi-s/common';

export class ExpirationCompletePublisher extends Publisher<OrderExpirationEvent> {
  readonly exchange = Exchanges.Expiration;
  readonly routingKey = RoutingKeys.ExpirationComplete;
}
