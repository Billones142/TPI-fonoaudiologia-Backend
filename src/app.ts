import express from "express";
import cors from "cors";
import apiRoutes from "./api/index";

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST ?? /^https?:\/\/localhost(:\d+)?$/,
  })
);

app.use("/api/v1", apiRoutes);

export default app;
