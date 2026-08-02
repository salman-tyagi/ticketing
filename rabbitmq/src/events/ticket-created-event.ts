import { Exchanges } from './exchanges';
import { QueuesBindings } from './queues-bindings';

export interface TicketCreatedEvent {
  exchange: Exchanges.TicketExchange;
  bindQueueKey: QueuesBindings.TicketCreated;
  data: {
    id: string;
    title: string;
    price: string;
  };
}
