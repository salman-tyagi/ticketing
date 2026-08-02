import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { app } from '../app';

let mongo: any;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    const promises = collections.map(collection => collection.deleteMany({}));
    await Promise.all(promises);
  }
});

afterAll(async () => {
  // Close the client first — stopping mongod out from under an open
  // connection makes mongoose hang trying to shut it down.
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});

declare global {
  var signin: () => Promise<string[]>;
}

global.signin = async () => {
  const res = await request(app)
    .post('/api/auth/signup')
    .send({ email: 'test@test.com', password: 'password' })
    .expect(201);

  const cookie = res.get('Set-Cookie') as string[];

  if (!cookie) throw Error('cookie is not set after signup');

  return cookie;
};
