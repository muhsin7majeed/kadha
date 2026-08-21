const DEFAULT_TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const imageBaseUrl = (import.meta.env.VITE_TMDB_IMAGE_BASE_URL || DEFAULT_TMDB_IMAGE_BASE_URL).replace(/\/+$/, '');

export const getTmdbImageUrl = (size: string, path: string) => `${imageBaseUrl}/${size}${path}`;
