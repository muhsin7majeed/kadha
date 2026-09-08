export const EXPORT_CATEGORIES = [
  'accountPreferences',
  'mediaTracking',
  'watchHistory',
  'collections',
  'recommendations',
  'friendships',
  'collectionRelationships',
  'notifications',
  'activity',
] as const;

export type ExportCategory = (typeof EXPORT_CATEGORIES)[number];

export const IMPORT_CATEGORIES = [
  'accountPreferences',
  'mediaTracking',
  'watchHistory',
  'collections',
  'recommendationSettings',
  'recommendationFeedback',
] as const;

export type ImportCategory = (typeof IMPORT_CATEGORIES)[number];

export const REFERENCE_ONLY_EXPORT_CATEGORIES: ExportCategory[] = [
  'friendships',
  'collectionRelationships',
  'notifications',
  'activity',
];

export const EXCLUDED_EXPORT_DATA = ['passwords', 'recovery codes', 'sessions', 'roles', 'account IDs'] as const;
