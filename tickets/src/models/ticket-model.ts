import mongoose from 'mongoose';

import { TicketSchema } from '../dtos/dto';

const ticketSchema = new mongoose.Schema<TicketSchema & { version: number }>(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret: any) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
    versionKey: 'version',
    optimisticConcurrency: true,
  },
);

export const Ticket = mongoose.model<TicketSchema & { version: number }>('Ticket', ticketSchema);
