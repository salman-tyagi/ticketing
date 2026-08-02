import { Exchanges, Publisher, RoutingKeys, TicketCreatedEvent } from '@tyagi-s/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly exchange = Exchanges.Ticket;
  readonly routingKey = RoutingKeys.TicketCreated;
}
