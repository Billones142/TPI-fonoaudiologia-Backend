import express, { Request, Response, NextFunction, Handler } from 'express';
import cors from 'cors';
import { PORT, secretKey } from './config/env.js';
import authRoutes from './api/routes/authRoutes.js';
import dataRoutes from './api/routes/dataRoutes.js';

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST ?? 'localhost',
  }),
);

app.use('/api', authRoutes, dataRoutes);


app.listen(PORT, () => {
  console.log(`started on port ${PORT}`);
});