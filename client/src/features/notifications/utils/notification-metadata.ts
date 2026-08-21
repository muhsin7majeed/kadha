export interface CollectionInviteMetadata {
  collectionName?: string;
  role?: 'viewer' | 'editor';
}

export const parseCollectionInviteMetadata = (metadata: string | null): CollectionInviteMetadata => {
  if (!metadata) return {};

  try {
    const parsed = JSON.parse(metadata) as unknown;

    if (!parsed || typeof parsed !== 'object') return {};

    const data = parsed as Record<string, unknown>;

    return {
      collectionName: typeof data.collectionName === 'string' ? data.collectionName : undefined,
      role: data.role === 'viewer' || data.role === 'editor' ? data.role : undefined,
    };
  } catch {
    return {};
  }
};

export interface SystemNotificationMetadata {
  collectionName?: string;
  count: number;
}

export const parseSystemNotificationMetadata = (metadata: string | null): SystemNotificationMetadata => {
  if (!metadata) return { count: 1 };

  try {
    const parsed = JSON.parse(metadata) as unknown;
    if (!parsed || typeof parsed !== 'object') return { count: 1 };

    const data = parsed as Record<string, unknown>;
    return {
      collectionName: typeof data.collectionName === 'string' ? data.collectionName : undefined,
      count: typeof data.count === 'number' && Number.isInteger(data.count) && data.count > 0 ? data.count : 1,
    };
  } catch {
    return { count: 1 };
  }
};
