import request from 'supertest';
import { channel } from '../../rabbitmq';

import { app } from '../../app';

describe('POST /api/tickets', () => {
  it('should have a valid route to handle post request on /api/tickets', async () => {
    const res = await request(app).post('/api/tickets');

    expect(res.status).not.toBe(404);
  });

  it('returns 401 if user is not signed in', async () => {
    await request(app).post('/api/tickets').expect(401);
  });

  it('should not return 401 if user is signed in', async () => {
    const res = await request(app).post('/api/tickets').set('Cookie', global.signin());

    expect(res.status).not.toBe(401);
  });

  it('returns error if invalid title is provided', async () => {
    await request(app).post('/api/tickets').set('Cookie', global.signin()).send({ title: 5454, price: 10 }).expect(400);
  });

  it('return error if invalid price is provided', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'test title', price: null })
      .expect(400);
  });

  it('creates a ticket with valid inputs', async () => {
    const title = 'test title';
    const price = 100;

    const res = await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title, price })
      .expect(201);

    expect(res.body).toMatchObject({
      id: expect.any(String),
      title,
      price,
      userId: expect.any(String),
    });
  });

  it('should create a TicketCreated event on success creation of ticket', async () => {
    await request(app)
      .post('/api/tickets')
      .set('Cookie', global.signin())
      .send({ title: 'title', price: 100 })
      .expect(201);

    expect(channel.publish).toHaveBeenCalled();
  });
});
