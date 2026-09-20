import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

const defaultItemIds = [
  'home',
  'discover',
  'recommendations',
  'watchlist',
  'in-progress',
  'upcoming',
  'collections',
  'activity',
  'diary',
  'watched',
  'liked',
  'friends',
  'settings',
  'menu',
];
const preUpcomingItemIds = defaultItemIds.filter((id) => id !== 'upcoming');
const legacyItemIds = defaultItemIds.filter((id) => id !== 'discover' && id !== 'upcoming');

const legacyCompactItems = (visibleIds: string[]) => {
  const visible = new Set(visibleIds);
  return legacyItemIds.map((id) => ({ id, visible: visible.has(id), display: 'both' }));
};

describe('navigation preferences', () => {
  it('returns defaults without creating a preference record', async () => {
    const user = await registerTestUser('navigation-defaults');

    const response = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data).toEqual({
      version: 1,
      layout: 'compact',
      items: defaultItemIds.map((id) => ({
        id,
        visible: ['home', 'discover', 'watchlist', 'in-progress', 'collections', 'menu'].includes(id),
        display: 'both',
      })),
    });
    expect(await prisma.navigationPreferences.count()).toBe(0);
  });

  it('saves reordered per-item visibility and presentation for only the current user', async () => {
    const user = await registerTestUser('navigation-owner');
    const otherUser = await registerTestUser('navigation-other');
    const items = defaultItemIds
      .map((id) => ({
        id,
        visible: id === 'home' || id === 'menu' || id === 'friends',
        display: id === 'home' ? 'label' : id === 'friends' ? 'icon' : 'both',
      }))
      .reverse();

    const saved = await request(await getTestApp())
      .put('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .send({ version: 1, layout: 'scrollable', items })
      .expect(200);

    expect(saved.body.data).toEqual({ version: 1, layout: 'scrollable', items });

    const ownPreferences = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .expect(200);
    expect(ownPreferences.body.data).toEqual(saved.body.data);

    const otherPreferences = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(otherUser))
      .expect(200);
    expect(otherPreferences.body.data.layout).toBe('compact');
    expect(otherPreferences.body.data.items.map((item: { id: string }) => item.id)).toEqual(defaultItemIds);
  });

  it('restores mandatory items when an update omits them', async () => {
    const user = await registerTestUser('navigation-mandatory');

    const response = await request(await getTestApp())
      .put('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .send({
        version: 1,
        layout: 'compact',
        items: [{ id: 'liked', visible: true, display: 'icon' }],
      })
      .expect(200);

    expect(response.body.data.items.filter((item: { visible: boolean }) => item.visible)).toEqual([
      { id: 'liked', visible: true, display: 'icon' },
      { id: 'home', visible: true, display: 'both' },
      { id: 'menu', visible: true, display: 'both' },
    ]);
  });

  it('rejects unknown, duplicate, and over-capacity compact configurations', async () => {
    const user = await registerTestUser('navigation-invalid');
    const app = await getTestApp();
    const auth = authorization(user);

    await request(app)
      .put('/api/navigation-preferences')
      .set('Authorization', auth)
      .send({
        version: 1,
        layout: 'compact',
        items: [{ id: 'unknown', visible: true, display: 'both' }],
      })
      .expect(400);

    await request(app)
      .put('/api/navigation-preferences')
      .set('Authorization', auth)
      .send({
        version: 1,
        layout: 'compact',
        items: [
          { id: 'home', visible: true, display: 'both' },
          { id: 'home', visible: true, display: 'icon' },
        ],
      })
      .expect(400);

    await request(app)
      .put('/api/navigation-preferences')
      .set('Authorization', auth)
      .send({
        version: 1,
        layout: 'compact',
        items: defaultItemIds.map((id, index) => ({ id, visible: index < 7, display: 'both' })),
      })
      .expect(400);
  });

  it('preserves a full legacy compact bar and appends Discover hidden', async () => {
    const user = await registerTestUser('navigation-legacy-full');
    const legacyVisibleIds = ['home', 'recommendations', 'watchlist', 'in-progress', 'collections', 'menu'];
    await prisma.navigationPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          layout: 'compact',
          items: legacyCompactItems(legacyVisibleIds),
        }),
      },
    });

    const response = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      ...legacyItemIds,
      'discover',
      'upcoming',
    ]);
    expect(
      response.body.data.items.filter((item: { visible: boolean }) => item.visible).map((item: { id: string }) => item.id),
    ).toEqual(legacyVisibleIds);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'discover').visible).toBe(false);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'upcoming').visible).toBe(false);
  });

  it('adds Discover to a legacy compact bar with a free slot without replacing For You', async () => {
    const user = await registerTestUser('navigation-legacy-space');
    const legacyVisibleIds = ['home', 'recommendations', 'watchlist', 'in-progress', 'menu'];
    await prisma.navigationPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          layout: 'compact',
          items: legacyCompactItems(legacyVisibleIds),
        }),
      },
    });

    const response = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      ...legacyItemIds,
      'discover',
      'upcoming',
    ]);
    expect(
      response.body.data.items.filter((item: { visible: boolean }) => item.visible).map((item: { id: string }) => item.id),
    ).toEqual([...legacyVisibleIds, 'discover']);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'recommendations').visible).toBe(true);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'upcoming').visible).toBe(false);
  });

  it('appends Upcoming hidden without displacing a saved compact destination', async () => {
    const user = await registerTestUser('navigation-pre-upcoming');
    const visibleIds = ['home', 'discover', 'watchlist', 'in-progress', 'collections', 'menu'];
    await prisma.navigationPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          layout: 'compact',
          items: preUpcomingItemIds.map((id) => ({ id, visible: visibleIds.includes(id), display: 'both' })),
        }),
      },
    });

    const response = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      ...preUpcomingItemIds,
      'upcoming',
    ]);
    expect(
      response.body.data.items.filter((item: { visible: boolean }) => item.visible).map((item: { id: string }) => item.id),
    ).toEqual(visibleIds);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'upcoming').visible).toBe(false);
  });

  it('normalizes stale stored preferences and appends newly known destinations', async () => {
    const user = await registerTestUser('navigation-stale');
    await prisma.navigationPreferences.create({
      data: {
        userId: user.userId,
        config: JSON.stringify({
          version: 1,
          layout: 'scrollable',
          items: [
            { id: 'liked', visible: true, display: 'icon' },
            { id: 'removed-destination', visible: true, display: 'both' },
          ],
        }),
      },
    });

    const response = await request(await getTestApp())
      .get('/api/navigation-preferences')
      .set('Authorization', authorization(user))
      .expect(200);

    expect(response.body.data.items[0]).toEqual({ id: 'liked', visible: true, display: 'icon' });
    expect(response.body.data.items.some((item: { id: string }) => item.id === 'removed-destination')).toBe(false);
    expect(response.body.data.items.map((item: { id: string }) => item.id)).toEqual([
      'liked',
      ...defaultItemIds.filter((id) => id !== 'liked'),
    ]);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'home').visible).toBe(true);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'diary').visible).toBe(false);
    expect(response.body.data.items.find((item: { id: string }) => item.id === 'menu').visible).toBe(true);
  });
});
