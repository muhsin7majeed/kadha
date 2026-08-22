import type { MediaMeta } from '@/types/common';
import type { MediaAction } from '../user-media.types';

export type MediaTrackingDetailsUpdate = Partial<
  Pick<MediaMeta, 'rating' | 'watchedOn' | 'likedNote' | 'watchedNote' | 'watchlistNote'>
>;

export const mediaTrackingActions: MediaAction[] = ['liked', 'watched', 'watchlist'];

export const hasActiveMediaTracking = (media: MediaMeta) =>
  mediaTrackingActions.some((action) => Boolean(media[action]));

export const getMediaTrackingNote = (media: MediaMeta, action: MediaAction) => {
  const note = media[`${action}Note`];

  return typeof note === 'string' ? note.trim() : '';
};

export const hasMediaTrackingDetails = (media: MediaMeta) => {
  const hasRating = media.rating != null && (Boolean(media.liked) || Boolean(media.watched));
  const hasWatchedDate = Boolean(media.watched && media.watchedOn);
  const hasActiveNote = mediaTrackingActions.some((action) =>
    Boolean(media[action] && getMediaTrackingNote(media, action)),
  );

  return hasRating || hasWatchedDate || hasActiveNote;
};

const hasField = <Key extends keyof MediaTrackingDetailsUpdate>(media: MediaMeta, key: Key) =>
  Object.prototype.hasOwnProperty.call(media, key);

export const getMediaTrackingDetailsUpdate = (media: MediaMeta): MediaTrackingDetailsUpdate => ({
  ...(hasField(media, 'rating') ? { rating: media.rating } : {}),
  ...(hasField(media, 'watchedOn') ? { watchedOn: media.watchedOn } : {}),
  ...(hasField(media, 'likedNote') ? { likedNote: media.likedNote } : {}),
  ...(hasField(media, 'watchedNote') ? { watchedNote: media.watchedNote } : {}),
  ...(hasField(media, 'watchlistNote') ? { watchlistNote: media.watchlistNote } : {}),
});
