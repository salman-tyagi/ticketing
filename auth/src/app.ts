import express from 'express';
import cookieParser from 'cookie-parser';

import { notFoundHandler, globalErrorHandler } from '@tyagi-s/common';

import { router as signupRouter } from './routes/signup.router';
import { router as signinRouter } from './routes/signin.router';
import { router as logoutRouter } from './routes/logout.router';
import { router as currentUserRouter } from './routes/current-user.router';

export const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(signupRouter);
app.use(signinRouter);
app.use(currentUserRouter);
app.use(logoutRouter);

app.all('*splat', notFoundHandler);

app.use(globalErrorHandler);
