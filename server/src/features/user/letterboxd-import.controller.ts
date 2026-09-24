import type { Request, Response } from 'express';

import { requireAuthUser } from '@/middlewares/auth';
import { sendResponse, tooManyRequests } from '@/lib/http';
import { importLetterboxdFilms, previewLetterboxdImport } from './letterboxd-import.service';
import { reserveLetterboxdWork } from './letterboxd-import.rate-limit';
import type { LetterboxdFilm, LetterboxdImportFilm } from './letterboxd-import.schema';

const withWorkBudget = async <T>(userId: string, films: number, res: Response, action: () => Promise<T>, writing = false) => {
  const lease = reserveLetterboxdWork(userId, films, writing);
  if ('retryAfter' in lease) {
    res.setHeader('Retry-After', lease.retryAfter);
    throw tooManyRequests('Letterboxd import is busy or has reached its temporary limit. Try again later.');
  }
  try {
    return await action();
  } finally {
    lease.release();
  }
};

export const previewLetterboxd = async (req: Request<{}, {}, { films: LetterboxdFilm[] }>, res: Response) => {
  const { id } = requireAuthUser(req);
  sendResponse(res, { data: await withWorkBudget(id, req.body.films.length, res, () => previewLetterboxdImport(id, req.body.films)) });
};

export const importLetterboxd = async (req: Request<{}, {}, { films: LetterboxdImportFilm[] }>, res: Response) => {
  const { id } = requireAuthUser(req);
  sendResponse(res, { data: await withWorkBudget(id, req.body.films.length, res, () => importLetterboxdFilms(id, req.body.films), true) });
};
