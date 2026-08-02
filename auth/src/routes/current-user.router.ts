import express from 'express';

import { protect } from '@tyagi-s/common';

export const router = express.Router();

router.get('/api/auth/me', protect, async (req, res) => {
  res.send(req.user);
});
