import mongoose from 'mongoose';
import z from 'zod';

export const paymentSchema = z.object({
  orderId: z.string().refine(val => mongoose.Types.ObjectId.isValid(val)),
  stripeId: z.string().nonempty(),
});

export type PaymentSchema = z.infer<typeof paymentSchema>;

export type PaymentModel = PaymentSchema & mongoose.Model<PaymentSchema> & { version: number };
