import { describe, expect, it } from 'vitest';

import type { MediaCardModel } from '@/features/media/media-card-model';
import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';

import buildUserMediaPayload from './build-user-media-payload';

const cardMedia: MediaCardModel = {
  adult: false,
  backdrop_path: '/backdrop.jpg',
  genre_ids: [18, 878],
  liked: true,
  media_id: 1,
  media_type: 'movie',
  original_language: 'en',
  original_title: 'Original Title',
  overview: 'Overview',
  popularity: 10,
  poster_path: '/poster.jpg',
  release_date: '2025-01-01',
  runtime: 120,
  status: 'Released',
  title: 'Example Movie',
  vote_average: 8,
  vote_count: 100,
  watched: false,
  watchlist: false,
};

const movieDetails: MovieDetailsWithMeta = {
  adult: false,
  backdrop_path: '/movie-backdrop.jpg',
  belongs_to_collection: null,
  budget: 100,
  genres: [
    { id: 12, name: 'Adventure' },
    { id: 878, name: 'Science Fiction' },
  ],
  homepage: null,
  imdb_id: null,
  liked: false,
  media_id: 2,
  media_type: 'movie',
  original_language: 'en',
  original_title: 'Movie Original',
  overview: 'Movie overview',
  popularity: 20,
  poster_path: '/movie-poster.jpg',
  production_companies: [],
  production_countries: [],
  release_date: '2025-02-02',
  revenue: 200,
  runtime: 142,
  spoken_languages: [],
  status: 'Released',
  tagline: null,
  title: 'Movie Details',
  video: false,
  vote_average: 7.5,
  vote_count: 250,
};

const tvDetails: TvDetailsWithMeta = {
  adult: false,
  backdrop_path: '/tv-backdrop.jpg',
  created_by: [],
  episode_run_time: [48],
  first_air_date: '2025-03-03',
  genres: [{ id: 35, name: 'Comedy' }],
  homepage: null,
  in_production: false,
  languages: ['en'],
  last_air_date: null,
  last_episode_to_air: null,
  media_id: 3,
  media_type: 'tv',
  name: 'TV Details',
  networks: [],
  next_episode_to_air: null,
  number_of_episodes: 8,
  number_of_seasons: 1,
  origin_country: ['US'],
  original_language: 'en',
  original_name: 'TV Original',
  overview: 'TV overview',
  popularity: 30,
  poster_path: '/tv-poster.jpg',
  production_companies: [],
  production_countries: [],
  seasons: [],
  spoken_languages: [],
  status: 'Ended',
  still_path: null,
  tagline: null,
  type: 'Scripted',
  vote_average: 8.2,
  vote_count: 500,
  watched: false,
};

describe('buildUserMediaPayload', () => {
  it('builds a payload from media card models', () => {
    expect(buildUserMediaPayload(cardMedia)).toEqual({
      adult: false,
      backdrop_path: '/backdrop.jpg',
      genre_ids: [18, 878],
      media_id: 1,
      media_type: 'movie',
      original_language: 'en',
      original_title: 'Original Title',
      overview: 'Overview',
      popularity: 10,
      poster_path: '/poster.jpg',
      release_date: '2025-01-01',
      runtime: 120,
      status: 'Released',
      title: 'Example Movie',
      vote_average: 8,
      vote_count: 100,
    });
  });

  it('toggles the requested action flag from the source media state', () => {
    expect(buildUserMediaPayload(cardMedia, 'liked').liked).toBe(false);
    expect(buildUserMediaPayload(cardMedia, 'watched').watched).toBe(true);
  });

  it('includes known tracking details without inventing missing values', () => {
    expect(
      buildUserMediaPayload({
        ...cardMedia,
        rating: 8,
        watchedOn: '2026-01-15',
        watchedNote: 'Private note',
      }),
    ).toMatchObject({
      rating: 8,
      watchedOn: '2026-01-15',
      watchedNote: 'Private note',
    });

    expect(buildUserMediaPayload(cardMedia)).not.toHaveProperty('rating');
  });

  it('normalizes movie details into a user media payload', () => {
    expect(buildUserMediaPayload(movieDetails, 'liked')).toMatchObject({
      genre_ids: [12, 878],
      liked: true,
      media_id: 2,
      media_type: 'movie',
      original_title: 'Movie Original',
      release_date: '2025-02-02',
      runtime: 142,
      status: 'Released',
      title: 'Movie Details',
    });
  });

  it('normalizes TV details into a user media payload', () => {
    expect(buildUserMediaPayload(tvDetails, 'watched')).toMatchObject({
      genre_ids: [35],
      media_id: 3,
      media_type: 'tv',
      original_title: 'TV Original',
      release_date: '2025-03-03',
      runtime: 48,
      status: 'Ended',
      title: 'TV Details',
      watched: true,
    });
  });
});
