import request from 'supertest';
import { app } from '../../app';

it('returns 200 on logout', async () => {
  await request(app).get('/api/auth/logout').expect(200);
});

it('clears cookie on signing out', async () => {
  const res = await request(app).get('/api/auth/logout').expect(200);

  expect(res.get('Set-Cookie')?.[0]).toEqual('token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
});
