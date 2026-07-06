import { TvProgressResponse, TvProgressStatus } from '../user-media.types';

export const tvProgressStatusLabel: Record<TvProgressStatus, string> = {
  not_started: 'Not started',
  plan_to_watch: 'Plan to watch',
  in_progress: 'In progress',
  caught_up: 'Caught up',
  completed: 'Completed',
};

export const getTvProgressPrimaryActionLabel = (progress?: TvProgressResponse) => {
  if (!progress || progress.watchedEpisodeCount === 0) return 'Track progress';
  if (progress.status === 'in_progress' && progress.nextEpisode) return 'Mark next episode';
  if (progress.status === 'caught_up') return 'Caught up';
  if (progress.status === 'completed') return 'Completed';

  return 'Track progress';
};

export const getNextEpisodeLabel = (progress?: TvProgressResponse) => {
  if (!progress?.nextEpisode) return null;

  return `S${progress.nextEpisode.seasonNumber} E${progress.nextEpisode.episodeNumber}`;
};
