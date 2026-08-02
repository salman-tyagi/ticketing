import express, { Request, Response } from 'express';
import { NotFoundException, Source, validate } from '@tyagi-s/common';

import { Ticket } from '../models/ticket-model';
import { findTicketParamsDto, FindTicketParamsDto } from '../dtos/dto';

export const router = express.Router();

router.get(
  '/api/tickets/:id',
  validate(Source.PARAMS, findTicketParamsDto),
  async (req: Request<FindTicketParamsDto>, res: Response) => {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) throw NotFoundException('Ticket not found');

    res.send(ticket);
  },
);
