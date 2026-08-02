import { Channel, Message } from 'amqplib';

export const channel = {
  // publish: (exchange: string, routingKey: string, content: Buffer>) => Boolean,
  publish: jest.fn().mockImplementation((exchange: string, routingKey: string, content: Buffer) => Boolean),
  ack: jest.fn().mockImplementation((msg: Message) => {}),
} as unknown as Channel;
