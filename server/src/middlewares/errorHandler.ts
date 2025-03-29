import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // This is for mongoose validation errors
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    return res.status(400).json({ message: "Validation failed", errors });
  }

  const statusCode = err.status || 500;
  const message = err.message || "Something went wrong";

  res.status(statusCode).json({ message });
};
