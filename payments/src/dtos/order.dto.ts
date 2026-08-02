import { OrderStatus } from '@tyagi-s/common';
import mongoose from 'mongoose';
import z from 'zod';

export const orderSchema = z.object({
  userId: z
    .string()
    .trim()
    .refine(val => mongoose.Types.ObjectId.isValid(val)),
  price: z.number().positive().int(),
  status: z.enum(OrderStatus),
});

export type OrderSchema = z.infer<typeof orderSchema>;

export type OrderDoc = OrderSchema & mongoose.Document & { version: number };

export type OrderModel = mongoose.Model<OrderDoc>;

export const createPaymentDto = z.object({
  token: z.string().trim().nonempty(),
  orderId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val)),
});

export type CreatePaymentDto = z.infer<typeof createPaymentDto>;
