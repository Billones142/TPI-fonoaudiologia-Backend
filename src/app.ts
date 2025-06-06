import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRoutes from './api/index';

const app = express();

app.get('/healthz', (req: Request, res: Response) => { // para Render y cron-job.org
  res.send('ok');
});

app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST ?? /^https?:\/\/localhost(:\d+)?$/,
  }),
);

// Add cookie parser middleware
app.use(cookieParser());

app.use('/api/v1', apiRoutes);

export default app
