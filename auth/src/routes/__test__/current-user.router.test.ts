import request from 'supertest';
import { app } from '../../app';

it('returns 200 on get current user', async () => {
  process.env.JWT_KEY = 'asdf';

  const cookie = await global.signin();
  await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);
});

it('returns user details on success get user', async () => {
  const cookie = await global.signin();
  const res = await request(app).get('/api/auth/me').set('Cookie', cookie).expect(200);

  expect(res.body).toMatchObject({ id: expect.any(String), email: 'test@test.com', iat: expect.any(Number) });
});

it('returns 401 on get user without logged in', async () => {
  await request(app).get('/api/auth/me').expect(401);
});
