export type ExportCategory =
  | 'accountPreferences'
  | 'mediaTracking'
  | 'watchHistory'
  | 'collections'
  | 'recommendations'
  | 'friendships'
  | 'collectionRelationships'
  | 'notifications'
  | 'activity';

export type ImportCategory =
  | 'accountPreferences'
  | 'mediaTracking'
  | 'watchHistory'
  | 'collections'
  | 'recommendationSettings'
  | 'recommendationFeedback';

export interface UserImportPayload {
  export: Record<string, unknown>;
  options?: {
    categories?: ImportCategory[];
    overwriteUserMediaDetails?: boolean;
    overwriteRecommendationSettings?: boolean;
  };
}

export interface UserImportPreview {
  source: {
    username: string | null;
    exportedAt: string | null;
    schemaVersion: number | null;
  };
  availableCategories: ImportCategory[];
  importable: {
    accountPreferences: number;
    media: number;
    watchEvents: number;
    collections: number;
    collectionItems: number;
    recommendationSettings: number;
    recommendationFeedback: number;
  };
  unsupported: {
    friendships: number;
    notifications: number;
    collectionMemberships: number;
    collectionInvites: number;
    activity: number;
  };
  conflicts: {
    collections: number;
  };
  warnings: string[];
}

export interface UserImportSummary {
  created: {
    media: number;
    watchEvents: number;
    collections: number;
    collectionItems: number;
    recommendationSettings: number;
    recommendationFeedback: number;
  };
  updated: {
    accountPreferences: number;
    media: number;
    recommendationSettings: number;
  };
  skipped: {
    accountPreferences: number;
    media: number;
    watchEvents: number;
    collections: number;
    collectionItems: number;
    recommendationSettings: number;
    recommendationFeedback: number;
    friendships: number;
    notifications: number;
    collectionMemberships: number;
    collectionInvites: number;
    activity: number;
  };
}
