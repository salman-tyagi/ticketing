import { Message, Channel, ConsumeMessage } from 'amqplib';
import { QueuesBindings } from './queues-bindings';
import { Exchanges } from './exchanges';

interface Event {
  exchange: Exchanges;
  bindQueueKey: QueuesBindings;
  data: any;
}

export abstract class Subscriber<T extends Event> {
  abstract queueName: string;
  abstract bindQueueKey: T['bindQueueKey'];
  abstract onMessage(data: T['data'], msg: Message): void;

  protected ackWait = 5 * 1000;

  constructor(protected channel: Channel) {}

  async consume() {
    await this.channel.prefetch(1);

    await this.channel.consume(
      this.queueName,
      message => {
        if (!message) return;

        console.log(`Event [${this.bindQueueKey}] subscribed on [${this.queueName}] queue`);

        const parsedData = this.parseMessage(message);
        this.onMessage(parsedData, message);
      },
      { noAck: false },
    );
  }

  private parseMessage(msg: ConsumeMessage) {
    let data: any;

    try {
      data = JSON.parse(msg.content.toString());
    } catch {
      data = msg.content.toString();
    }

    return data;
  }
}
