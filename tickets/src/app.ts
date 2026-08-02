import express from 'express';
import cookieParser from 'cookie-parser';

import { notFoundHandler, globalErrorHandler } from '@tyagi-s/common';

import { router as createTicketRouter } from './routes/create-ticket';
import { router as findTicketRouter } from './routes/find-ticket';
import { router as updateTicketRouter } from './routes/update-ticket';
import { router as findAllTicketsRouter } from './routes/find-tickets';

export const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(createTicketRouter);
app.use(findTicketRouter);
app.use(updateTicketRouter);
app.use(findAllTicketsRouter);

app.all('*splat', notFoundHandler);

app.use(globalErrorHandler);
