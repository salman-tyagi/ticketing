import express, { Request, Response } from 'express';

import { JwtService, Source, validate, BadRequestException } from '@tyagi-s/common';

import { User } from '../models/user.model';
import { SignupDto, signupSchema } from '../dtos/dto';

export const router = express.Router();

router.post(
  '/api/auth/signup',
  validate(Source.BODY, signupSchema),
  async (req: Request<any, any, SignupDto>, res: Response) => {
    const { email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) throw BadRequestException('Email is already in use');

    user = await User.create({ email, password });

    const token = JwtService.signJwt({ id: user.id, email: user.email });

    res
      .status(201)
      .cookie('token', token, { httpOnly: true, secure: true })
      .send({ data: { user } });
  },
);
