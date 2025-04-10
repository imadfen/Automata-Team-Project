import { Request, Response } from "express";
import { register, login, getCurrentUser } from "../services/authService.js";

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await register(email, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const getCurrentUserController = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    const user = await getCurrentUser(token as string);
    res.json(user);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};
