import type { OwnerMediaLibraryKey, UserMedia } from '@/features/user-media/user-media.types';
import { formatDate } from '@/utils/date';

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
