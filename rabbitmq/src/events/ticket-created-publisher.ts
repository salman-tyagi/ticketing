import { Exchanges } from './exchanges';
import { Publisher } from './publisher';
import { QueuesBindings } from './queues-bindings';
import { TicketCreatedEvent } from './ticket-created-event';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  exchangeName = Exchanges.TicketExchange;
  readonly routingKey = QueuesBindings.TicketCreated;
}
