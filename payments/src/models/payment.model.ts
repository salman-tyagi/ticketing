import mongoose from 'mongoose';

import { PaymentSchema, PaymentModel } from '../dtos/payment.dto';

const paymentSchema = new mongoose.Schema<PaymentSchema, PaymentModel>(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: 'version',
    optimisticConcurrency: true,
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  },
);

export const Payment = mongoose.model<PaymentSchema, PaymentModel>('Payment', paymentSchema);
