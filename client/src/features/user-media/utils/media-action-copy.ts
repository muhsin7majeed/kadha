import { MediaType } from '@/types/common';
import { MediaAction, UserMediaPayload } from '../user-media.types';

interface MediaActionToast {
  title: string;
  description?: string;
}

interface MediaActionCopy {
  actionLabel: (isActive: boolean) => string;
  stateLabel: (isActive: boolean) => string;
  toast: (payload: UserMediaPayload, title: string) => MediaActionToast;
}

const mediaTypeLabel: Record<MediaType, string> = {
  movie: 'movie',
  tv: 'TV show',
};

const mediaActionCopy: Record<MediaAction, MediaActionCopy> = {
  liked: {
    actionLabel: (isActive) => (isActive ? 'Unlike' : 'Like'),
    stateLabel: (isActive) => (isActive ? 'Liked' : 'Like'),
    toast: (payload, title) => ({
      title: payload.liked ? `Liked ${title}` : `Removed ${title} from liked`,
    }),
  },
  watched: {
    actionLabel: (isActive) => (isActive ? 'Mark unwatched' : 'Mark watched'),
    stateLabel: (isActive) => (isActive ? 'Watched' : 'Mark watched'),
    toast: (payload, title) => ({
      title: payload.watched ? `Marked ${title} watched` : `Marked ${title} unwatched`,
      description: payload.watched ? 'Removed from watchlist too.' : undefined,
    }),
  },
  watchlist: {
    actionLabel: (isActive) => (isActive ? 'Remove from watchlist' : 'Add to watchlist'),
    stateLabel: (isActive) => (isActive ? 'In watchlist' : 'Watchlist'),
    toast: (payload, title) => ({
      title: payload.watchlist ? `Added ${title} to watchlist` : `Removed ${title} from watchlist`,
    }),
  },
};

export const getMediaActionLabel = (action: MediaAction, isActive: boolean) =>
  mediaActionCopy[action].actionLabel(isActive);

export const getMediaActionStateLabel = (action: MediaAction, isActive: boolean) =>
  mediaActionCopy[action].stateLabel(isActive);

export const getMediaActionToast = (action: MediaAction, payload: UserMediaPayload) => {
  const title = payload.title || `This ${mediaTypeLabel[payload.media_type]}`;

  return mediaActionCopy[action].toast(payload, title);
};

export const getUndoMediaActionPayload = (action: MediaAction, payload: UserMediaPayload): UserMediaPayload => ({
  ...payload,
  [action]: true,
});
