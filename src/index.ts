import express, { Request, Response, NextFunction, Handler } from 'express';
import cors from 'cors';
import { PORT, secretKey } from './config/env';
import apiRoutes from "./api/index";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST ?? /^https?:\/\/localhost(:\d+)?$/,
  }),
);

app.use('/api/v1', apiRoutes);


app.listen(PORT, () => {
  console.log(`started on port ${PORT}`);
});