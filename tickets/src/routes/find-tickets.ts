import express from 'express';

import { Ticket } from '../models/ticket-model';

export const router = express.Router();

router.get('/api/tickets', async (req, res) => {
  const tickets = await Ticket.find({
    orderId: undefined,
  });

  res.send(tickets);
});
