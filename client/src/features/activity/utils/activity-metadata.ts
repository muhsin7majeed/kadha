import { ActivityMetadata } from '@/features/activity/activity.types';

const isActivityMetadata = (value: unknown): value is ActivityMetadata => {
  return typeof value === 'object' && value !== null;
};

export const parseActivityMetadata = (metadata: string | null): ActivityMetadata => {
  if (!metadata) return {};

  try {
    const parsed = JSON.parse(metadata) as unknown;
    return isActivityMetadata(parsed) ? parsed : {};
  } catch {
    return {};
  }
};
