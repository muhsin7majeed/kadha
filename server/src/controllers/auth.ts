import { Request, Response } from "express";
import userModel from "@/models/user";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { envConfig } from "@/config/env";

interface LoginAndRegisterBody {
  username: string;
  password: string;
}

export const register = async (
  req: Request<{}, {}, LoginAndRegisterBody>,
  res: Response
) => {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (user) {
    return res
      .status(400)
      .json({ fieldErrors: { username: "Username already exists" } });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userModel.create({
    username,
    password: hashedPassword,
  });

  const token = jwt.sign({ id: newUser._id }, envConfig.jwtSecret);

  res.json({
    message: "User registered successfully",
    token,
    userId: newUser._id,
  });
};

export const login = async (
  req: Request<{}, {}, LoginAndRegisterBody>,
  res: Response
) => {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  const token = jwt.sign({ id: user._id }, envConfig.jwtSecret);

  res.json({
    message: "User logged in successfully",
    token,
    userId: user._id,
  });
};
