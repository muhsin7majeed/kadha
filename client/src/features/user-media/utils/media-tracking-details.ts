import type { MediaMeta } from '@/types/common';
import type { MediaAction } from '../user-media.types';

export const mediaTrackingActions: MediaAction[] = ['liked', 'watched', 'watchlist'];

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
