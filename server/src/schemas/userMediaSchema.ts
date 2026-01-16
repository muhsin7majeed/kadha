import { z } from "zod";

const userMediaSchema = z.object({
  mediaId: z.number({ required_error: "Media ID is required" }),
  mediaType: z.enum(["movie", "tv"], {
    required_error: "Media type is required",
  }),

  liked: z.boolean().optional().default(false),
  watched: z.boolean().optional().default(false),
  watchlist: z.boolean().optional().default(false),

  title: z.string({ required_error: "Title is required" }),
  posterPath: z.string({ required_error: "Poster path is required" }),
  voteAverage: z.number({ required_error: "Vote average is required" }),
  voteCount: z.number({ required_error: "Vote count is required" }),
  adult: z.boolean({ required_error: "Adult is required" }),
  genreIds: z.array(z.number({ required_error: "Genre IDs are required" })),
  releaseDate: z.string({ required_error: "Release date is required" }),
});

export default userMediaSchema;
