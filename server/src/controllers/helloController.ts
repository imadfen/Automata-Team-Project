import { hello } from "../services/helloService.js";

import { Request, Response } from "express";

const helloController = async (req: Request, res: Response) => {
  const results = await hello();
  res.status(200).json(results);
};

export default helloController;
