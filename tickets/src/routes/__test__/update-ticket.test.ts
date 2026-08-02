import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';
import { channel } from '../../rabbitmq';
import { Ticket } from '../../models/ticket-model';

it('should return 400 bad request error if invalid id id provided', async () => {
  const id = '543fgg7f7g8dg';

  await request(app).patch(`/api/tickets/${id}`).set('Cookie', global.signin()).expect(400);
});

it('should return 404 not found error if ticket is not found with the given id', async () => {
  const id = new mongoose.Types.ObjectId();

  await request(app)
    .patch(`/api/tickets/${id}`)
    .set('Cookie', global.signin())
    .send({ title: 'title', price: 123 })
    .expect(404);
});

it('should return 401 unauthorized error if user is not logged in', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'concert', price: 43 })
    .expect(201);

  await request(app).patch(`/api/tickets/${res.body.id}`).send({ title: 'concert', price: 34 }).expect(401);
});

it('should return 400 bad request error if invalid title or price provided', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'concert', price: 43 })
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: '', price: 34 })
    .expect(400);

  await request(app)
    .patch(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'concert', price: '' })
    .expect(400);
});

it('should return 404 not found error if ticket is not found with related logged in user', async () => {
  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'asdf', price: 123 })
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${res.body.id}`)
    .set('Cookie', global.signin())
    .send({ title: 'new title', price: 34 })
    .expect(404);
});

it('should update the ticket if ticket is found with related user id and ticket id', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdf', price: 123 })
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'new title', price: 34 })
    .expect(201);
});

it('should publish a ticket updated event on successful ticket update', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'asdf', price: 123 })
    .expect(201);

  await request(app)
    .patch(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'new title', price: 34 })
    .expect(201);

  expect(channel.publish).toHaveBeenCalled();
});

it('rejects the ticket update if ticket is already reserved', async () => {
  const cookie = global.signin();

  const res = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({ title: 'concert', price: 100 })
    .expect(201);

  const ticket = await Ticket.findById(res.body.id);

  ticket!.orderId = new mongoose.Types.ObjectId();
  await ticket?.save();

  await request(app)
    .patch(`/api/tickets/${res.body.id}`)
    .set('Cookie', cookie)
    .send({ title: 'new concert', price: 999 })
    .expect(409);
});
