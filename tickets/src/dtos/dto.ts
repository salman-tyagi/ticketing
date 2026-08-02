import mongoose from 'mongoose';
import z from 'zod';

const objectId = (type: string) =>
  z
    .string()
    .refine(val => mongoose.Types.ObjectId.isValid(val), `${type} id is not a valid MongoDB ObjectId`)
    .transform(val => new mongoose.Types.ObjectId(val));

export const baseSchema = z.object({
  title: z.string().trim().nonempty().max(50),
  price: z.number().positive().max(9999),
  userId: objectId('User'),
  orderId: objectId('Order').optional(),
});

export type TicketSchema = z.infer<typeof baseSchema>;

export type TicketDoc = TicketSchema & mongoose.Document & { version: number };

export const createTicketDto = baseSchema.pick({ title: true, price: true });
export type CreateTicketDto = Pick<TicketSchema, 'title' | 'price'>;

export const findTicketParamsDto = z.object({ id: objectId('Ticket').transform(val => val.toHexString()) });
export type FindTicketParamsDto = z.infer<typeof findTicketParamsDto>;

export const updateTicketDto = createTicketDto.partial({ title: true, price: true });
export type UpdateTicketDto = Partial<CreateTicketDto>;
