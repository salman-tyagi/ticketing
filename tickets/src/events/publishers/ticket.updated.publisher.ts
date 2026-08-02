import { Exchanges, Publisher, RoutingKeys, TicketUpdatedEvent } from '@tyagi-s/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly exchange = Exchanges.Ticket;
  readonly routingKey = RoutingKeys.TicketUpdated;
}
