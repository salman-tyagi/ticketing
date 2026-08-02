import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket-model';

it('should throw optimistic concurrency error', async () => {
  // Create a ticket
  const ticket = await Ticket.create({
    title: 'CONCERT',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  // Find 2 ticket instances
  const instanceOne = await Ticket.findById(ticket.id);
  const instanceTwo = await Ticket.findById(ticket.id);

  // Update instances 1 by 1
  instanceOne?.set({ price: '30' });
  instanceTwo?.set({ price: '30' });

  // Save instances
  await instanceOne?.save();

  // Should throw error
  await expect(instanceTwo?.save()).rejects.toThrow(mongoose.Error.VersionError);
});

it('should add version number on every create or update the ticket', async () => {
  const ticket = await Ticket.create({
    title: 'title',
    price: 100,
    userId: new mongoose.Types.ObjectId().toHexString(),
  });

  expect(ticket.version).toEqual(0);

  ticket.set({ price: '200' });
  await ticket.save();
  expect(ticket.version).toEqual(1);

  ticket.set({ price: '300' });
  await ticket.save();
  expect(ticket.version).toEqual(2);

  ticket.set({ price: '400' });
  await ticket.save();
  expect(ticket.version).toEqual(3);
});
