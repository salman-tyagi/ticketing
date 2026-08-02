import request from 'supertest';
import { app } from '../../app';

it('returns 200 on success login', async () => {
  process.env.JWT_KEY = 'asdf';

  await request(app).post('/api/auth/signup').send({ email: 'test@test.com', password: 'password' }).expect(201);

  await request(app).post('/api/auth/signin').send({ email: 'test@test.com', password: 'password' }).expect(200);
});

it('returns 404 if no user found', async () => {
  await request(app).post('/api/auth/signin').send({ email: 'test@test.com', password: 'password' }).expect(400);
});

it('returns 400 if incorrect password provided', async () => {
  await request(app).post('/api/auth/signup').send({ email: 'test@test.com', password: 'password' }).expect(201);

  await request(app).post('/api/auth/signin').send({ email: 'test@test.com', password: 'pass' }).expect(400);
});

it('returns 400 if no email provided', async () => {
  await request(app).post('/api/auth/signin').send({ password: 'password' }).expect(400);
});

it('returns 400 if no password provided', async () => {
  await request(app).post('/api/auth/signin').send({ email: 'test@test.com' }).expect(400);
});

it('returns 400 if email and password are not provided', async () => {
  await request(app).post('/api/auth/signin').send({}).expect(400);
});

it('returns 400 if body is not provided', async () => {
  await request(app).post('/api/auth/signin').send().expect(400);
});

it('sends cookie in response on successful login', async () => {
  await request(app).post('/api/auth/signup').send({ email: 'test@test.com', password: 'password' }).expect(201);

  const res = await request(app)
    .post('/api/auth/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);

  expect(res.get('Set-Cookie')).toBeDefined();
});

it('sends user data in response on successful login', async () => {
  await request(app).post('/api/auth/signup').send({ email: 'test@test.com', password: 'password' }).expect(201);

  const res = await request(app)
    .post('/api/auth/signin')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(200);

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
