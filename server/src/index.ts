import "express-async-errors";

import express, { Express, Request, Response } from "express";
import cors from "cors";
import { envConfig } from "./config/env";
import { connectDB } from "./config/db";
import authRoutes from "./routes/auth";
import userRoutes from "./routes/user";
import { errorHandler } from "./middlewares/errorHandler";

const app: Express = express();

// Middlewarezz
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to What to Watch API" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(envConfig.port, "0.0.0.0", () => {
  console.log(`Server is running on port ${envConfig.port}`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection");
});
