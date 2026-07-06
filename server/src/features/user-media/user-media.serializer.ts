interface UserMediaTrackingFields {
  rating?: number | null;
  ratedAt?: Date | string | null;
  watchedOn?: Date | string | null;
  likedNote?: string | null;
  watchedNote?: string | null;
  watchlistNote?: string | null;
}

export const formatWatchedOnForApi = (value: Date | string | null | undefined) => {
  if (!value) return null;

  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
};

export const pickUserMediaTrackingDetails = (item: UserMediaTrackingFields | null | undefined) => ({
  rating: item?.rating ?? null,
  ratedAt: item?.ratedAt ?? null,
  watchedOn: formatWatchedOnForApi(item?.watchedOn),
  likedNote: item?.likedNote ?? null,
  watchedNote: item?.watchedNote ?? null,
  watchlistNote: item?.watchlistNote ?? null,
});

export const formatUserMediaTrackingDetails = <T extends UserMediaTrackingFields>(item: T): T & { watchedOn: string | null } => ({
  ...item,
  watchedOn: formatWatchedOnForApi(item.watchedOn),
});

export const stripPrivateUserMediaTrackingDetails = <T extends UserMediaTrackingFields>(
  item: T,
): Omit<T, keyof UserMediaTrackingFields> => {
  const { rating, ratedAt, watchedOn, likedNote, watchedNote, watchlistNote, ...publicItem } = item;

  return publicItem;
};
