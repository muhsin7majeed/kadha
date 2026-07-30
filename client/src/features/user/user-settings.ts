import type { UpdateUserPayload, User } from '@/features/user/user.types';

export const getUpdateUserPayload = (user: User): UpdateUserPayload => ({
  username: user.username,
  profilePrivacy: user.profilePrivacy,
  watchedPrivacy: user.watchedPrivacy,
  likedPrivacy: user.likedPrivacy,
  watchlistPrivacy: user.watchlistPrivacy,
  watchRegion: user.watchRegion,
});
