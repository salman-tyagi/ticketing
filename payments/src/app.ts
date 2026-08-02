import express from 'express';
import cookieParser from 'cookie-parser';

import { notFoundHandler, globalErrorHandler } from '@tyagi-s/common';

import { router as createPaymentRouter } from './routes/create-payment';

export const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(createPaymentRouter);

app.all('*splat', notFoundHandler);

app.use(globalErrorHandler);
