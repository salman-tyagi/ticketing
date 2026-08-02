import request from 'supertest';
import { OrderStatus } from '@tyagi-s/common';
import mongoose from 'mongoose';

import { app } from '../../app';
import { Order } from '../../models/order.model';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment.model';

// jest.mock('../../stripe.ts');

it('user must be logged in to create a charge', async () => {
  await request(app).post('/api/payments').send({ token: '12345', orderId: new mongoose.Types.ObjectId() }).expect(401);
});

it('throws 400 error if invalid input provided', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ token: '', orderId: new mongoose.Types.ObjectId() })
    .expect(400);

  await request(app).post('/api/payments').set('Cookie', global.signin()).send({ token: '24354545454' }).expect(400);
});

it('throws 404 not found error if order is not found with given order id', async () => {
  const userId = new mongoose.Types.ObjectId();

  await Order.create({
    userId: userId.toHexString(),
    status: OrderStatus.Created,
    price: 100,
  });

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ orderId: new mongoose.Types.ObjectId(), token: '5435435345' })
    .expect(404);
});

it("throws 404 not found error on purchasing other user's order", async () => {
  const order = await Order.create({
    userId: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 100,
  });

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin())
    .send({ orderId: order.id, token: '5435435345' })
    .expect(404);
});

it('throws 404 not found error on purchasing cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId();

  const order = await Order.create({
    userId: userId.toHexString(),
    status: OrderStatus.Cancelled,
    price: 100,
  });

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ orderId: order.id, token: '5435435345' })
    .expect(404);
});

it('charges the payment and creates a successful payment doc', async () => {
  const userId = new mongoose.Types.ObjectId();
  const price = Math.floor(Math.random() * 100000);

  const order = await Order.create({
    userId: userId.toHexString(),
    status: OrderStatus.Created,
    price,
  });

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signin(userId))
    .send({ orderId: order.id, token: 'tok_visa' })
    .expect(201);

  // FAKE TEST *********************
  // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  // expect(chargeOptions.currency).toEqual('usd');
  // expect(chargeOptions.amount).toEqual(order.price * 100);
  // expect(chargeOptions.source).toEqual('tok_visa');
  // *****************************

  // REALISTIC TEST
  const chargeResponse = await stripe.charges.list({ limit: 50 });
  const charge = chargeResponse.data.find(charge => charge.amount === price * 100);

  expect(charge).toBeDefined();
  expect(charge?.amount).toEqual(price * 100);

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: charge?.id,
  });

  expect(payment).not.toBeNull();
});
