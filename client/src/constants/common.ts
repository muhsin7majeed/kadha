import { DataPrivacy } from '@/types/common';

export const DATA_PRIVACY_OPTIONS = Object.entries(DataPrivacy).map(([key, value]) => ({
  label: key,
  value: value,
}));
