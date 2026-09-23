import type { MediaCardModel } from '@/features/media/media-card-model';
import { formatDate, minutesToHours } from '@/utils/date';

export const getMediaRuntime = (media: MediaCardModel) =>
  media.runtime != null && media.runtime > 0
    ? `${minutesToHours(media.runtime)}${media.media_type === 'tv' ? '/episode' : ''}`
    : '—';

export const getMediaScore = (media: MediaCardModel) =>
  media.vote_average > 0 ? media.vote_average.toFixed(1) : '—';

export const getMediaYear = (media: MediaCardModel) =>
  media.release_date ? formatDate(media.release_date, 'YYYY') : '—';
