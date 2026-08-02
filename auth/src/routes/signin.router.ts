import express, { Request, Response } from 'express';

import { JwtService, Source, validate, BadRequestException } from '@tyagi-s/common';

import { User } from '../models/user.model';
import { SigninDto, signinSchema } from '../dtos/dto';

export const router = express.Router();

router.post(
  '/api/auth/signin',
  validate(Source.BODY, signinSchema),
  async (req: Request<any, any, SigninDto>, res: Response) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }, { '+password': 1 });

    if (!user) throw BadRequestException('Incorrect email or password');

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) throw BadRequestException('Incorrect email or password');

    const token = JwtService.signJwt({ id: user.id, email: user.email });

    res.cookie('token', token, { httpOnly: true, secure: true }).send({ data: { user } });
  },
);
