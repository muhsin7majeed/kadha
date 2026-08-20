import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';
import { createTestCollection } from './helpers/collection';
import { updateUserMediaFlag } from './helpers/user-media';

describe('activity routes', () => {
  it('lists current user activity from account, media, and collection actions', async () => {
    const user = await registerTestUser('activity-user');

    await updateUserMediaFlag(user, 'watched', true, 884101);
    await createTestCollection(user, 'Activity collection');

    const response = await request(await getTestApp())
      .get('/api/user/activity')
      .set('Authorization', authorization(user))
      .expect(200);

    const activityTypes = response.body.data.map((activity: { type: string }) => activity.type);

    expect(response.body.pagination.total).toBeGreaterThanOrEqual(3);
    expect(activityTypes).toEqual(
      expect.arrayContaining(['ACCOUNT_CREATED', 'MEDIA_WATCHED', 'COLLECTION_CREATED']),
    );
  });

  it('records logout activity when a refresh cookie is present', async () => {
    const user = await registerTestUser('logout-activity-user');

    await request(await getTestApp())
      .post('/api/auth/logout')
      .set('Cookie', [`jwt=${user.refreshToken}`])
      .send({})
      .expect(200);

    const response = await request(await getTestApp())
      .get('/api/user/activity')
      .set('Authorization', authorization(user))
      .expect(200);

    const activityTypes = response.body.data.map((activity: { type: string }) => activity.type);

    expect(activityTypes).toEqual(expect.arrayContaining(['ACCOUNT_CREATED', 'ACCOUNT_LOGGED_OUT']));
  });

  it('keeps activity isolated to the current user', async () => {
    const firstUser = await registerTestUser('activity-first-user');
    const secondUser = await registerTestUser('activity-second-user');

    await updateUserMediaFlag(firstUser, 'liked', true, 884201);

    const secondUserResponse = await request(await getTestApp())
      .get('/api/user/activity')
      .set('Authorization', authorization(secondUser))
      .expect(200);

    const secondUserActivityTypes = secondUserResponse.body.data.map((activity: { type: string }) => activity.type);

    expect(secondUserActivityTypes).toEqual(['ACCOUNT_CREATED']);
  });
});
