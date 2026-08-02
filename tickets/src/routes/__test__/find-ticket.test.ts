import request from 'supertest';
import mongoose from 'mongoose';

import { app } from '../../app';

it('throw bad request error if valid mongo id is not provided', async () => {
  const id = 'gf76g87fgf98g7';

  await request(app).get(`/api/tickets/${id}`).expect(400);
});

it('returns 404 not found error if ticket is not found', async () => {
  const id = new mongoose.Types.ObjectId();

  const res = await request(app).get(`/api/tickets/${id}`).expect(404);

  expect(res.body).toEqual({
    status: 'fail',
    statusCode: 404,
    message: 'Ticket not found',
    timestamp: expect.any(String),
  });
});

it('returns 200 with success response data if ticket is found with a ticket id', async () => {
  const title = 'ticket title';
  const price = 99;

  const createRes = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title, price })
    .expect(201);

  const findRes = await request(app).get(`/api/tickets/${createRes.body.id}`).expect(200);

  expect(findRes.body).toMatchObject({
    id: createRes.body.id,
    title,
    price,
    userId: createRes.body.userId,
  });
});
