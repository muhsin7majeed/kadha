import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const requiredEnvVars = ["MONGO_URI"];

requiredEnvVars.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
});

export const envConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
};
