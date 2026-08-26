import { DataPrivacy } from '@/types/common';

export const DATA_PRIVACY_OPTIONS = [
  { label: 'Anyone on the web', value: DataPrivacy.Public },
  { label: 'Kadha users', value: DataPrivacy.KadhaUsers },
  { label: 'Friends', value: DataPrivacy.Friends },
  { label: 'Only me', value: DataPrivacy.OnlyMe },
];

export const PROFILE_PRIVACY_OPTIONS = [
  { label: 'Anyone on the web', value: DataPrivacy.Public },
  { label: 'Kadha users', value: DataPrivacy.KadhaUsers },
  { label: 'Friends', value: DataPrivacy.Friends },
  { label: 'Private', value: DataPrivacy.OnlyMe },
];
