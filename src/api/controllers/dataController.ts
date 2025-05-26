import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/logged.js";

const dataController = async (req: AuthenticatedRequest, res: Response) => {
  res.json({ message: 'data', user: req.user });
}

export default dataController;