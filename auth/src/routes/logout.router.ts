import express from 'express';

export const router = express.Router();

router.get('/api/auth/logout', async (req, res) => {
  res.clearCookie('token').send({ message: 'Logged out!' });
});
