import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "TMDB_API_KEY",
  "TMDB_BEARER_TOKEN",
];

requiredEnvVars.forEach((env) => {
  if (!process.env[env]) {
    throw new Error(`Missing required environment variable: ${env}`);
  }
});

export const envConfig = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  tmdbApiKey: process.env.TMDB_API_KEY || "",
  tmdbBearerToken: process.env.TMDB_BEARER_TOKEN || "",
};
