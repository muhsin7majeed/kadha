import request from 'supertest';

import { getTestApp } from './app';
import { authorization, TestUser } from './auth';

export type UserMediaFlag = 'liked' | 'watched' | 'watchlist';

interface TestMediaPayloadOptions {
  mediaId?: number;
  mediaType?: 'movie' | 'tv';
  liked?: boolean;
  watched?: boolean;
  watchlist?: boolean;
  rating?: number | null;
  watchedOn?: string | null;
  likedNote?: string | null;
  watchedNote?: string | null;
  watchlistNote?: string | null;
}

export interface UserMediaListItem {
  media_id: number;
  media_type: 'movie' | 'tv';
  title: string;
  liked: boolean;
  watched: boolean;
  watchlist: boolean;
  likedAt: string | null;
  watchedAt: string | null;
  watchlistAt: string | null;
  rating?: number | null;
  ratedAt?: string | null;
  watchedOn?: string | null;
  likedNote?: string | null;
  watchedNote?: string | null;
  watchlistNote?: string | null;
}

export interface UserMediaListResponseBody {
  data: UserMediaListItem[];
  pagination: {
    total: number;
  };
}

export interface UserMediaAccessResponseBody {
  data: UserMediaListItem[];
  pagination?: {
    total: number;
  };
  access: {
    canView: boolean;
    lockedReason?: 'PRIVATE' | 'FRIENDS_ONLY';
  };
}

export const buildTestMediaPayload = ({
  mediaId = 881001,
  mediaType = 'movie',
  liked = false,
  watched = false,
  watchlist = false,
  rating,
  watchedOn,
  likedNote,
  watchedNote,
  watchlistNote,
}: TestMediaPayloadOptions = {}) => ({
  media_id: mediaId,
  media_type: mediaType,
  liked,
  watched,
  watchlist,
  title: `Test Movie ${mediaId}`,
  original_title: `Test Movie ${mediaId}`,
  overview: 'A movie created by the user-media integration test suite.',
  poster_path: null,
  backdrop_path: null,
  vote_average: 8.1,
  vote_count: 120,
  popularity: 14.2,
  adult: false,
  genre_ids: [12, 18],
  release_date: '2026-02-01',
  original_language: 'en',
  runtime: 118,
  status: 'Released',
  ...(rating !== undefined ? { rating } : {}),
  ...(watchedOn !== undefined ? { watchedOn } : {}),
  ...(likedNote !== undefined ? { likedNote } : {}),
  ...(watchedNote !== undefined ? { watchedNote } : {}),
  ...(watchlistNote !== undefined ? { watchlistNote } : {}),
});

export const updateUserMediaFlag = async (
  user: TestUser,
  flag: UserMediaFlag,
  flagValue: boolean,
  mediaId = 881001,
  details: Omit<TestMediaPayloadOptions, 'mediaId' | 'mediaType'> = {},
) => {
  return request(await getTestApp())
    .post(`/api/user-media/${flag}`)
    .set('Authorization', authorization(user))
    .send(
      buildTestMediaPayload({
        mediaId,
        [flag]: flagValue,
        ...details,
      }),
    )
    .expect(200);
};

export const getCurrentUserMediaList = async (user: TestUser, flag: UserMediaFlag) => {
  const response = await request(await getTestApp())
    .get(`/api/user/${flag}`)
    .set('Authorization', authorization(user))
    .expect(200);

  return response.body as UserMediaListResponseBody;
};

export const getUserMediaListByUsername = async (viewer: TestUser, username: string, flag: UserMediaFlag) => {
  const response = await request(await getTestApp())
    .get(`/api/users/${username}/${flag}`)
    .set('Authorization', authorization(viewer))
    .expect(200);

  return response.body as UserMediaAccessResponseBody;
};
