import express, { Request, Response } from 'express';
import { Source, validate, protect } from '@tyagi-s/common';

import { CreateTicketDto, createTicketDto } from '../dtos/dto';
import { Ticket } from '../models/ticket-model';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created.publisher';
import { channel } from '../rabbitmq';

export const router = express.Router();

router.post(
  '/api/tickets',
  protect,
  validate(Source.BODY, createTicketDto),
  async (req: Request<any, any, CreateTicketDto>, res: Response) => {
    const { title, price } = req.body;

    const ticket = await Ticket.create({ title, price, userId: req.user?.id });

    new TicketCreatedPublisher(channel).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId.toHexString(),
      version: ticket.version,
    });

    res.status(201).send(ticket);
  },
);
