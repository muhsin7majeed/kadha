import { createHash } from 'node:crypto';

import { fetchMediaDetails, searchMoviesByQuery } from '@/features/media/tmdb.client';
import { badRequest } from '@/lib/http';
import { prisma } from '@/lib/prisma';
import { applyUserImport, importedWatchEventRequestId } from './user-import.service';
import type { LetterboxdFilm, LetterboxdImportFilm } from './letterboxd-import.schema';

const normalizeTitle = (value: string) => value.normalize('NFKC').trim().toLocaleLowerCase();

const findCandidates = async (film: LetterboxdFilm) => {
  try {
    const response = await searchMoviesByQuery(film.title, 1);
    const candidates = response.results.map((movie) => ({
      id: movie.id,
      title: movie.title,
      year: Number(movie.release_date?.slice(0, 4)) || null,
      posterPath: movie.poster_path,
    }));
    const exact = candidates.filter(
      (movie) => normalizeTitle(movie.title) === normalizeTitle(film.title) && movie.year === film.year,
    );
    return { uri: film.uri, candidates, suggestedId: exact.length === 1 && response.total_pages === 1 ? exact[0].id : null, error: false };
  } catch {
    return { uri: film.uri, candidates: [], suggestedId: null, error: true };
  }
};

const sourceEventId = (uri: string, sourceId: string) => createHash('sha256').update(`${uri}:${sourceId}`).digest('hex');
const watchEventId = (film: LetterboxdFilm, watch: LetterboxdFilm['watches'][number]) =>
  sourceEventId(watch.sourceUri ?? film.uri, watch.sourceId);
const filmSourceUris = (film: LetterboxdFilm) => [film.uri, ...film.watches.flatMap((watch) => watch.sourceUri ? [watch.sourceUri] : [])];

export const previewLetterboxdImport = async (userId: string, films: LetterboxdFilm[]) => {
  const results = [];
  for (let index = 0; index < films.length; index += 3) {
    results.push(...await Promise.all(films.slice(index, index + 3).map(findCandidates)));
  }
  const ids = [...new Set(results.flatMap((result) => result.candidates.map((candidate) => candidate.id)))];
  const eventIds = films.flatMap((film) => film.watches.map((watch) =>
    importedWatchEventRequestId('letterboxd', watchEventId(film, watch)),
  ));
  const [tracked, events, mappings] = await Promise.all([
    prisma.userMedia.findMany({
      where: { userId, media_type: 'movie', media_id: { in: ids } },
      select: { media_id: true, rating: true },
    }),
    prisma.watchEvent.findMany({
      where: { userId, clientRequestId: { in: eventIds } },
      select: { clientRequestId: true },
    }),
    prisma.letterboxdFilmMatch.findMany({
      where: { userId, uri: { in: [...new Set(films.flatMap(filmSourceUris))] } },
    }),
  ]);
  const byId = new Map(tracked.map((item) => [item.media_id, item]));
  const importedIds = new Set(events.map((event) => event.clientRequestId));
  const mappedIds = new Map(mappings.map((mapping) => [mapping.uri, mapping.tmdbId]));
  return results.map((result, index) => {
    const savedIds = [...new Set(filmSourceUris(films[index]).flatMap((uri) => mappedIds.has(uri) ? [mappedIds.get(uri)!] : []))];
    const mappingConflict = savedIds.length > 1;
    const mappedId = mappingConflict ? null : savedIds[0] ?? null;
    let suggestedId = mappingConflict ? null : result.suggestedId;
    if (mappedId !== null) {
      suggestedId = result.candidates.some((candidate) => candidate.id === mappedId) ? mappedId : null;
    }
    return {
      ...result,
      suggestedId,
      mappedId,
      mappingConflict,
      importedWatches: films[index].watches.filter((watch) =>
        importedIds.has(importedWatchEventRequestId('letterboxd', watchEventId(films[index], watch))),
      ).length,
      candidates: result.candidates.map((candidate) => ({
        ...candidate,
        existing: byId.has(candidate.id),
        ratingKept: byId.get(candidate.id)?.rating != null,
      })),
    };
  });
};

export const importLetterboxdFilms = async (userId: string, films: LetterboxdImportFilm[]) => {
  const ids = new Set<number>();
  const sourceUris = new Set<string>();
  const movies: Awaited<ReturnType<typeof fetchMediaDetails>>[] = [];
  for (const film of films) {
    if (ids.has(film.tmdbId) || sourceUris.has(film.uri)) throw badRequest('Select each film only once per import.');
    ids.add(film.tmdbId);
    sourceUris.add(film.uri);
  }
  for (let index = 0; index < films.length; index += 3) {
    movies.push(...await Promise.all(films.slice(index, index + 3).map((film) => fetchMediaDetails('movie', film.tmdbId))));
  }

  return prisma.$transaction(async (tx) => {
    const mediaTracking = [];
    const watchEvents = [];
    const mediaSnapshots = [];
    const mappings = await tx.letterboxdFilmMatch.findMany({
      where: { userId, uri: { in: [...new Set(films.flatMap(filmSourceUris))] } },
    });
    const mappedIds = new Map(mappings.map((mapping) => [mapping.uri, mapping.tmdbId]));
    for (const film of films) {
      if (filmSourceUris(film).some((uri) => mappedIds.has(uri) && mappedIds.get(uri) !== film.tmdbId)) {
        throw badRequest('This film was previously imported with another TMDB match.');
      }
    }
    const requestIds = films.flatMap((film) => film.watches.map((watch) =>
      importedWatchEventRequestId('letterboxd', watchEventId(film, watch)),
    ));
    const existingEvents = await tx.watchEvent.findMany({
      where: { userId, clientRequestId: { in: requestIds } },
      select: { media_id: true, clientRequestId: true },
    });
    const existingById = new Map(
      existingEvents.flatMap((event) => event.clientRequestId ? [[event.clientRequestId, event.media_id] as const] : []),
    );
    for (const [index, film] of films.entries()) {
      const movie = movies[index];
      if (movie.id !== film.tmdbId || !('title' in movie)) throw badRequest('Could not verify a selected movie.');
      const media = {
        media_id: movie.id,
        media_type: 'movie' as const,
        title: movie.title,
        original_title: movie.original_title,
        release_date: movie.release_date,
        overview: movie.overview,
        poster_path: movie.poster_path,
        backdrop_path: movie.backdrop_path,
        genre_ids: movie.genres.map((genre) => genre.id),
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        popularity: movie.popularity,
        adult: movie.adult,
        original_language: movie.original_language,
        runtime: movie.runtime,
        status: movie.status,
      };
      mediaSnapshots.push(media);
      const dated = film.watches
        .map((event) => event.watchedOn)
        .filter((date): date is string => date !== null)
        .sort();
      const importedAt = new Date().toISOString();
      mediaTracking.push({
        media_id: movie.id,
        media_type: 'movie' as const,
        watched: film.watched || film.watches.length > 0,
        liked: film.liked,
        likedAt: film.liked ? importedAt : null,
        watchlist: film.watchlist && !film.watched,
        watchlistAt: film.watchlist && !film.watched ? importedAt : null,
        watchedAt: film.watched || film.watches.length ? importedAt : null,
        rating: film.rating,
        ratedAt: film.rating !== null ? importedAt : null,
        watchedOn: dated.at(-1) ?? null,
      });
      for (const watch of film.watches) {
        const eventId = watchEventId(film, watch);
        const previousMovie = existingById.get(importedWatchEventRequestId('letterboxd', eventId));
        if (previousMovie !== undefined && previousMovie !== movie.id) {
          throw badRequest('This film was previously imported with another TMDB match.');
        }
        watchEvents.push({ media_id: movie.id, media_type: 'movie' as const, eventId, watchedOn: watch.watchedOn });
      }
    }

    const result = await applyUserImport(userId, {
      export: {
        schemaVersion: 2,
        format: 'kadha-data-export',
        data: { accountPreferences: { id: 'letterboxd' }, mediaTracking, mediaSnapshots, watchEvents },
      },
      options: { categories: ['mediaTracking', 'watchHistory'] },
    }, tx);
    const newMappings = films.filter((film) => !mappedIds.has(film.uri));
    if (newMappings.length) {
      await tx.letterboxdFilmMatch.createMany({
        data: newMappings.map((film) => ({ userId, uri: film.uri, tmdbId: film.tmdbId })),
      });
    }
    return result;
  }, { timeout: 30_000 });
};
