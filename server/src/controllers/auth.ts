import { Request, Response } from "express";

interface LoginAndRegisterBody {
  username: string;
  password: string;
}

export const register = (
  req: Request<{}, {}, LoginAndRegisterBody>,
  res: Response
) => {
  const { username, password } = req.body;
  console.log(`User registered: ${username}`);

  res.json({ message: "User registered successfully" });
};

export const login = (
  req: Request<{}, {}, LoginAndRegisterBody>,
  res: Response
) => {
  const { username, password } = req.body;
  console.log(`User logged in: ${username}`);

  res.json({ message: "User logged in successfully" });
};
