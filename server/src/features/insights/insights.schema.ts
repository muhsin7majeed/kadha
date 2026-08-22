import { z } from "zod";

export const insightsQuerySchema = z.object({
  mediaType: z.enum(["all", "movie", "tv"]).optional().default("all"),
});
