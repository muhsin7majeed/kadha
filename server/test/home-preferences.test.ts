import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

const defaultItems = [
  { id: 'continue-watching', visible: true },
  { id: 'watchlist', visible: true },
  { id: 'recommendations', visible: true },
  { id: 'trending-movies', visible: true },
  { id: 'trending-tv', visible: true },
];

describe('home preferences', () => {
  it('requires authentication', async () => {
    await request(await getTestApp()).get('/api/home-preferences').expect(401);
  });

  it('returns defaults without creating a preference record', async () => {
    const user = await registerTestUser('home-defaults');

    const response = await request(await getTestApp())
      .get('/api/home-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data).toEqual({ version: 1, items: defaultItems });
    expect(await prisma.homePreferences.count()).toBe(0);
  });

  it('saves section order and visibility for only the current user', async () => {
    const user = await registerTestUser('home-owner');
    const otherUser = await registerTestUser('home-other');
    const items = [
      { id: 'recommendations', visible: true },
      { id: 'continue-watching', visible: false },
      { id: 'trending-tv', visible: true },
      { id: 'watchlist', visible: true },
      { id: 'trending-movies', visible: false },
    ];

    const saved = await request(await getTestApp())
      .put('/api/home-preferences')
      .set('Authorization', authorization(user))
      .send({ version: 1, items })
      .expect(200);

    expect(saved.body.data).toEqual({ version: 1, items });

    const ownPreferences = await request(await getTestApp())
      .get('/api/home-preferences')
      .set('Authorization', authorization(user))
      .expect(200);
    expect(ownPreferences.body.data).toEqual(saved.body.data);

    const otherPreferences = await request(await getTestApp())
      .get('/api/home-preferences')
      .set('Authorization', authorization(otherUser))
      .expect(200);
    expect(otherPreferences.body.data).toEqual({ version: 1, items: defaultItems });
  });

  it('rejects unknown and duplicate sections', async () => {
    const user = await registerTestUser('home-invalid');
    const app = await getTestApp();
    const auth = authorization(user);

    await request(app)
      .put('/api/home-preferences')
      .set('Authorization', auth)
      .send({ version: 1, items: [{ id: 'unknown', visible: true }] })
      .expect(400);

    await request(app)
      .put('/api/home-preferences')
      .set('Authorization', auth)
      .send({
        version: 1,
        items: [
          { id: 'watchlist', visible: true },
          { id: 'watchlist', visible: false },
        ],
      })
      .expect(400);
  });

  it('normalizes stale stored preferences and appends newly known sections', async () => {
    const user = await registerTestUser('home-stale');
    await prisma.homePreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          items: [
            { id: 'recommendations', visible: false },
            { id: 'removed-section', visible: true },
            { id: 'recommendations', visible: true },
          ],
        }),
      },
    });

    const response = await request(await getTestApp())
      .get('/api/home-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data).toEqual({
      version: 1,
      items: [
        { id: 'recommendations', visible: false },
        ...defaultItems.filter((item) => item.id !== 'recommendations'),
      ],
    });
  });
});
