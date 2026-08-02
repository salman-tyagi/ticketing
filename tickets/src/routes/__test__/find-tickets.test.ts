import request from 'supertest';

import { app } from '../../app';

it('should return list of tickets with 200 status code', async () => {
  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'fdjshfk', price: 5454 })
    .expect(201);

  await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signin())
    .send({ title: 'fdjshfk', price: 5454 })
    .expect(201);

  const res = await request(app).get('/api/tickets').expect(200);

  expect(res.body.length).toBe(2);
});
