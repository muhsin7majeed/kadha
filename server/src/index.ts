import express, { Express, Request, Response } from "express";
import cors from "cors";
import { envConfig } from "./config/env";
import { connectDB } from "./config/db";

const app: Express = express();

// Middlewarezz
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Basic route
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to What to Watch API" });
});

// Start server
app.listen(envConfig.port, "0.0.0.0", () => {
  console.log(`Server is running on port ${envConfig.port}`);
});
