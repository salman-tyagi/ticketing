import request from 'supertest';
import { app } from '../../app';

it('returns 201 on successful signup', async () => {
  process.env.JWT_KEY = 'test';

  await request(app).post('/api/auth/signup').send({ email: 'test@test.com', password: 'password' }).expect(201);
});

it('returns 400 if signs up again with same email', async () => {
  await request(app).post('/api/auth/signup').send({ email: 'test@test.com', password: 'pass' }).expect(400);
});

it('returns 400 if email is not provided', async () => {
  await request(app).post('/api/auth/signup').send({ password: 'password' }).expect(400);
});

it('returns 400 if password is not provided', async () => {
  await request(app).post('/api/auth/signup').send({ email: 'test@test.com' }).expect(400);
});

it('returns 400 if invalid email is not provided', async () => {
  await request(app).post('/api/auth/signup').send({ email: 'test' }).expect(400);
});

it('returns 400 if no email and no password are not provided', async () => {
  await request(app).post('/api/auth/signup').send().expect(400);
});

it('sets cookie in response on success signup', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);

  expect(res.get('Set-Cookie')).toBeDefined();
});

it('sends user in response on success signup', async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);

  expect(res.body).toMatchObject({
    data: {
      user: {
        id: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      },
    },
  });
});
