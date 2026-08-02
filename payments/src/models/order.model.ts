import { OrderStatus } from '@tyagi-s/common';
import mongoose from 'mongoose';

import { OrderSchema, OrderModel } from '../dtos/order.dto';

const orderSchema = new mongoose.Schema<OrderSchema, OrderModel>(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: OrderStatus,
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

export const Order = mongoose.model<OrderSchema, OrderModel>('Order', orderSchema);
