import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

describe('media card preferences', () => {
  it('requires authentication', async () => {
    const app = await getTestApp();
    await request(app).get('/api/media-card-preferences').expect(401);
    await request(app).put('/api/media-card-preferences').send({ version: 1, style: 'minimal' }).expect(401);
  });

  it('defaults to detailed without creating a row', async () => {
    const user = await registerTestUser('card-default');
    const response = await request(await getTestApp())
      .get('/api/media-card-preferences')
      .set('Authorization', authorization(user))
      .expect(200);
    expect(response.body.data).toEqual({ version: 1, style: 'detailed' });
    expect(await prisma.mediaCardPreferences.count()).toBe(0);
  });

  it('persists a strict choice per account and repairs invalid stored values on read', async () => {
    const user = await registerTestUser('card-owner');
    const other = await registerTestUser('card-other');
    const app = await getTestApp();
    const auth = authorization(user);
    for (const payload of [
      { version: 2, style: 'minimal' },
      { version: 1, style: 'expanded' },
      { version: 1, style: 'minimal', extra: true },
    ]) {
      await request(app).put('/api/media-card-preferences').set('Authorization', auth).send(payload).expect(400);
    }
    await request(app).put('/api/media-card-preferences').set('Authorization', auth)
      .send({ version: 1, style: 'minimal' }).expect(200);
    expect((await request(app).get('/api/media-card-preferences').set('Authorization', auth).expect(200)).body.data)
      .toEqual({ version: 1, style: 'minimal' });
    expect((await request(app).get('/api/media-card-preferences').set('Authorization', authorization(other)).expect(200)).body.data)
      .toEqual({ version: 1, style: 'detailed' });
    await prisma.mediaCardPreferences.update({ where: { userId: user.userId }, data: { config: 'broken' } });
    expect((await request(app).get('/api/media-card-preferences').set('Authorization', auth).expect(200)).body.data)
      .toEqual({ version: 1, style: 'detailed' });
  });
});
