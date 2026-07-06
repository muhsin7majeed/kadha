import request from 'supertest';

import { authorization, TestUser } from './auth';
import { getTestApp } from './app';

export type TestCollectionMemberRole = 'viewer' | 'editor';

interface CollectionResponseBody {
  data: {
    id: string;
    name: string;
    userId: string;
  };
}

interface CollectionInviteResponseBody {
  data: {
    id: string;
    inviteeId: string;
    role: TestCollectionMemberRole;
  };
}

interface CollectionInviteResultBody {
  data: {
    id: string;
    status: string;
  };
}

export const createTestCollection = async (owner: TestUser, name = 'Shared watch ideas') => {
  const response = await request(await getTestApp())
    .post('/api/collection')
    .set('Authorization', authorization(owner))
    .send({
      name,
      description: 'Movies and shows to check later',
      privacy: 'ONLY_ME',
    })
    .expect(200);

  return (response.body as CollectionResponseBody).data;
};

export const inviteUserToCollection = async (
  owner: TestUser,
  collectionId: string,
  invitee: TestUser,
  role: TestCollectionMemberRole,
) => {
  const response = await request(await getTestApp())
    .post(`/api/collection/${collectionId}/invites`)
    .set('Authorization', authorization(owner))
    .send({
      inviteeId: invitee.userId,
      role,
    })
    .expect(201);

  return (response.body as CollectionInviteResponseBody).data;
};

export const acceptCollectionInvite = async (invitee: TestUser, inviteId: string) => {
  const response = await request(await getTestApp())
    .post(`/api/collection/invites/${inviteId}/respond`)
    .set('Authorization', authorization(invitee))
    .send({ action: 'accept' })
    .expect(200);

  return (response.body as CollectionInviteResultBody).data;
};

export const addMovieToCollection = async (
  user: TestUser,
  collectionId: string,
  mediaId = 991001,
  expectedStatus = 200,
) => {
  return request(await getTestApp())
    .post(`/api/collection/${collectionId}/items`)
    .set('Authorization', authorization(user))
    .send({
      id: mediaId,
      media_type: 'movie',
      title: `Test Movie ${mediaId}`,
      original_title: `Test Movie ${mediaId}`,
      overview: 'A movie created by the integration test suite.',
      poster_path: null,
      backdrop_path: null,
      vote_average: 7.5,
      vote_count: 42,
      popularity: 12.5,
      adult: false,
      genre_ids: [18],
      release_date: '2026-01-01',
      original_language: 'en',
      runtime: 120,
      status: 'Released',
    })
    .expect(expectedStatus);
};
