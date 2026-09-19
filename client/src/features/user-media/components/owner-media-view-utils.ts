import type { OwnerMediaLibraryKey, UserMedia } from '@/features/user-media/user-media.types';
import { formatDate, minutesToHours } from '@/utils/date';

const libraryMeta = {
  liked: { dateKey: 'likedAt', dateLabel: 'Liked', tableLabel: 'Liked' },
  watched: { dateKey: 'watchedAt', dateLabel: 'Watched', tableLabel: 'Watched' },
  watchlist: { dateKey: 'watchlistAt', dateLabel: 'Watchlisted', tableLabel: 'Watchlisted' },
} as const;

export const getOwnerLibraryMeta = (libraryKey: OwnerMediaLibraryKey) => libraryMeta[libraryKey];

export const getOwnerMediaDate = (media: UserMedia, libraryKey: OwnerMediaLibraryKey) => {
  const value = media[libraryMeta[libraryKey].dateKey];
  return value ? formatDate(value, 'DD MMM YYYY') : '—';
};

export const getOwnerMediaRuntime = (media: UserMedia) =>
  media.runtime != null && media.runtime > 0
    ? `${minutesToHours(media.runtime)}${media.media_type === 'tv' ? '/episode' : ''}`
    : '—';

export const getOwnerMediaScore = (media: UserMedia) =>
  media.vote_average > 0 ? media.vote_average.toFixed(1) : '—';

export const getOwnerMediaYear = (media: UserMedia) =>
  media.release_date ? formatDate(media.release_date, 'YYYY') : '—';
