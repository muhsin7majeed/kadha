import type { WatchProvidersResponse } from '@/features/media/media.types';

export type WatchProviderGroupKey = keyof WatchProvidersResponse['providers'];

export const WATCH_PROVIDER_GROUPS: Array<{
  key: WatchProviderGroupKey;
  label: string;
}> = [
  { key: 'stream', label: 'Stream' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'free', label: 'Free' },
  { key: 'ads', label: 'Ads' },
];
