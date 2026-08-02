import express, { Request, Response } from 'express';
import { protect, NotFoundException, Source, validate, OrderStatus } from '@tyagi-s/common';

import { stripe } from '../stripe';
import { Order } from '../models/order.model';
import { CreatePaymentDto, createPaymentDto } from '../dtos/order.dto';
import { Payment } from '../models/payment.model';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created.publisher';
import { channel } from '../rabbitmq';

export const router = express.Router();

router.post(
  '/api/payments',
  protect,
  validate(Source.BODY, createPaymentDto),
  async (req: Request<any, any, CreatePaymentDto>, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findOne({
      _id: orderId,
      userId: req.user?.id,
      status: { $ne: OrderStatus.Cancelled },
    });

    if (!order) throw NotFoundException('Failed to create charge. Order not found');

    const charge = await stripe.charges.create({
      currency: 'usd',
      amount: order.price * 100,
      source: token,
    });

    const payment = await Payment.create({
      orderId,
      stripeId: charge.id,
    });

    // Publish payment created event
    new PaymentCreatedPublisher(channel).publish({
      id: payment.id,
      orderId: payment.orderId,
      stripeId: payment.id,
    });

    res.status(201).send({
      payment,
    });
  },
);
