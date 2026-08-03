import http from 'node:http';

import { connectMongoDB } from './database';
import { startServer } from './server';

let server: http.Server;

function gracefulShutDown(reason: string, err: unknown) {
  console.log(reason, err);

  if (!server) process.exit(1);

  console.log(`SHUTTING DOWN THE SERVER GRACEFULLY...`);

  server.close(() => {
    console.log('SERVER CLOSED!');
    process.exit(1);
  });
}

process.on('uncaughtException', err => {
  gracefulShutDown('UNCAUGHT_EXCEPTION:', err);
});

process.on('unhandledRejection', err => {
  gracefulShutDown('UNHANDLED_REJECTION:', err);
});

(async function main() {
  try {
    console.log('App starting...');

    if (!process.env.JWT_KEY) throw Error('JWT KEY must be defined');
    if (!process.env.MONGO_URI) throw Error('MONGO URI must be defined');

    await connectMongoDB();
    server = startServer();
  } catch (err) {
    console.log('[MAIN_ERROR]:', err);
  }
})();
