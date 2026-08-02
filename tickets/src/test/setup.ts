import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';

import { JwtService } from '@tyagi-s/common';

import { app } from '../app';

jest.mock('../rabbitmq.ts');

let mongo: any;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  jest.clearAllMocks();

  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    const promises = collections.map(collection => collection.deleteMany({}));
    await Promise.all(promises);
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongo) await mongo.stop();
});

declare global {
  var signin: (userId?: mongoose.Types.ObjectId) => string[];
}

global.signin = (userId: mongoose.Types.ObjectId = new mongoose.Types.ObjectId()) => {
  process.env.JWT_KEY = 'asdf';
  const payload = { id: userId.toHexString(), email: 'test@test.com' };

  const cookie = JwtService.signJwt(payload);
  return [`token=${cookie}`];
};
