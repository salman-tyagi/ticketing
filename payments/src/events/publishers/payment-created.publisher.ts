import { Publisher, PaymentCreatedEvent, Exchanges, RoutingKeys } from '@tyagi-s/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly exchange = Exchanges.Payment;
  readonly routingKey = RoutingKeys.PaymentCreated;
}
