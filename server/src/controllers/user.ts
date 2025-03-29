import { Request, Response } from "express";
import userModel from "@/models/user";

export const getMe = async (req: Request, res: Response) => {
  const { id } = req.user;

  const user = await userModel.findById(id);

  const userWithoutPassword = user?.toObject();

  delete (userWithoutPassword as any)?.password;

  res.json(userWithoutPassword);
};
