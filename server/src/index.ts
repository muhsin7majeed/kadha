import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

const app: Express = express();
const port = Number(process.env.PORT) || 5000;
const MONGO_URI = process.env.MONGO_URI || "";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Basic route
app.get("/", (req: Request, res: Response) => {
  console.log(process.env.MONGO_URI);
  res.json({ message: "Welcome to What to Watch API" });
});

// Start server
app.listen(port, "0.0.0.0", () => {
  console.log(`Server is running on port ${port}`);
});
