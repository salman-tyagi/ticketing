import express, { Request, Response } from 'express';
import { ConflictException, NotFoundException, protect, Source, validate } from '@tyagi-s/common';

import { channel } from '../rabbitmq';
import { Ticket } from '../models/ticket-model';
import { findTicketParamsDto, FindTicketParamsDto, UpdateTicketDto, updateTicketDto } from '../dtos/dto';
import { TicketUpdatedPublisher } from '../events/publishers/ticket.updated.publisher';

export const router = express.Router();

router.patch(
  '/api/tickets/:id',
  protect,
  validate(Source.PARAMS, findTicketParamsDto),
  validate(Source.BODY, updateTicketDto),
  async (req: Request<FindTicketParamsDto, any, UpdateTicketDto>, res: Response) => {
    const { id } = req.params;
    const { title, price } = req.body;

    const ticket = await Ticket.findOne({
      _id: id,
      userId: req.user?.id,
    });

    if (!ticket) throw NotFoundException('No ticket found');

    if (ticket.orderId) throw ConflictException("Reserved ticket can't be updated");

    if (
      (title && price && ticket.title === title && ticket.price === price) ||
      (!title && price && ticket.price === price) ||
      (!price && title && ticket.title === title)
    ) {
      res.send(ticket);
      return;
    }

    const updateFields: UpdateTicketDto = {};

    if (title) updateFields.title = title;
    if (price) updateFields.price = price;

    ticket.set(updateFields);
    const updatedTicket = await ticket.save({ validateModifiedOnly: true });

    new TicketUpdatedPublisher(channel).publish({
      id: updatedTicket.id,
      title: updatedTicket.title,
      price: updatedTicket.price,
      userId: updatedTicket.userId.toHexString(),
      version: updatedTicket.version,
    });

    res.status(201).send(updatedTicket);
  },
);
