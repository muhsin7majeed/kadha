import request from 'supertest';

import { getTestApp } from './app';
import { authorization, TestUser } from './auth';

export type TestDataPrivacy = 'ONLY_ME' | 'FRIENDS' | 'EVERYONE';

interface UpdateUserPrivacyOptions {
  profilePrivacy?: TestDataPrivacy;
  watchedPrivacy?: TestDataPrivacy;
  likedPrivacy?: TestDataPrivacy;
  watchlistPrivacy?: TestDataPrivacy;
}

export interface UserProfileResponseBody {
  id: string;
  username: string;
  profilePrivacy: TestDataPrivacy;
  friendshipStatus: string;
  access: {
    canView: boolean;
    lockedReason?: 'PRIVATE' | 'FRIENDS_ONLY';
  };
  sections: {
    watched: boolean;
    liked: boolean;
    watchlist: boolean;
    collections: boolean;
  };
}

export const updateUserPrivacy = async (user: TestUser, options: UpdateUserPrivacyOptions) => {
  return request(await getTestApp())
    .put('/api/user/me')
    .set('Authorization', authorization(user))
    .send({
      username: user.username,
      profilePrivacy: options.profilePrivacy ?? 'EVERYONE',
      watchedPrivacy: options.watchedPrivacy ?? 'FRIENDS',
      likedPrivacy: options.likedPrivacy ?? 'FRIENDS',
      watchlistPrivacy: options.watchlistPrivacy ?? 'ONLY_ME',
      watchRegion: 'US',
    })
    .expect(200);
};

export const getUserProfile = async (viewer: TestUser, username: string) => {
  const response = await request(await getTestApp())
    .get(`/api/users/${username}/profile`)
    .set('Authorization', authorization(viewer))
    .expect(200);

  return response.body as UserProfileResponseBody;
};
