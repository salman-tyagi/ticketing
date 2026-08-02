import { Channel } from 'amqplib';
import { QueuesBindings } from './queues-bindings';
import { Exchanges } from './exchanges';

interface Event {
  exchange: Exchanges;
  bindQueueKey: QueuesBindings;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract exchangeName: T['exchange'];
  abstract routingKey: T['bindQueueKey'];

  constructor(private channel: Channel) {}

  async publish(data: T['data']) {
    this.channel.publish(this.exchangeName, this.routingKey, Buffer.from(JSON.stringify(data)));

    console.log(`Event [${this.routingKey}] published to [${this.exchangeName}] exchange`);
  }
}
