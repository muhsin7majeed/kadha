export type MediaCardStyle = 'minimal' | 'detailed';

export interface MediaCardPreferences {
  version: 1;
  style: MediaCardStyle;
}

export const DEFAULT_MEDIA_CARD_PREFERENCES: MediaCardPreferences = { version: 1, style: 'detailed' };
