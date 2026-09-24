import { z } from 'zod';

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
});

const film = z.object({
  uri: z.string().url().max(300).refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && ['boxd.it', 'letterboxd.com', 'www.letterboxd.com'].includes(url.hostname);
  }),
  title: z.string().trim().min(1).max(300),
  year: z.number().int().min(1870).max(2100),
  watched: z.boolean(),
  liked: z.boolean(),
  watchlist: z.boolean(),
  rating: z.number().int().min(1).max(10).nullable(),
  watches: z.array(z.object({ sourceId: z.string().min(1).max(100), watchedOn: calendarDate.nullable() })).max(200),
});

const withinDiaryLimit = (films: { watches: unknown[] }[]) =>
  films.reduce((count, entry) => count + entry.watches.length, 0) <= 2000;

export const letterboxdPreviewSchema = z.object({
  films: z.array(film).min(1).max(100).refine(withinDiaryLimit, 'Too many diary entries in one batch.'),
});
export const letterboxdImportSchema = z.object({
  films: z.array(film.extend({ tmdbId: z.number().int().positive() })).min(1).max(100)
    .refine(withinDiaryLimit, 'Too many diary entries in one batch.'),
});

export type LetterboxdFilm = z.infer<typeof film>;
export type LetterboxdImportFilm = z.infer<typeof letterboxdImportSchema>['films'][number];
