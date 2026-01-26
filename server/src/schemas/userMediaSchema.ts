import { z } from 'zod';

const userMediaSchema = z.object({
  id: z.coerce.string().optional(),
  media_id: z.number({ required_error: 'Media ID is required' }),
  media_type: z.enum(['movie', 'tv'], {
    required_error: 'Media type is required',
  }),

  liked: z.boolean().optional().default(false),
  watched: z.boolean().optional().default(false),
  watchlist: z.boolean().optional().default(false),

  title: z.string({ required_error: 'Title is required' }),
  poster_path: z.string({ required_error: 'Poster path is required' }),
  vote_average: z.number({ required_error: 'Vote average is required' }),
  vote_count: z.number({ required_error: 'Vote count is required' }),
  adult: z.boolean({ required_error: 'Adult is required' }),
  genre_ids: z.array(z.number({ required_error: 'Genre IDs are required' })),
  release_date: z.string({ required_error: 'Release date is required' }),
});

export default userMediaSchema;
