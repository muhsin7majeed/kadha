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
