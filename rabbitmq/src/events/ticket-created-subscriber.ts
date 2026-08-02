import { Message } from 'amqplib';

import { Subscriber } from './subscriber';
import { TicketCreatedEvent } from './ticket-created-event';
import { QueuesBindings } from './queues-bindings';

export class TicketCreatedSubscriber extends Subscriber<TicketCreatedEvent> {
  queueName = 'tickets-service';
  readonly bindQueueKey = QueuesBindings.TicketCreated;

  onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    console.log('Event Data:', data);

    this.channel.ack(msg);
  }
}
