import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { prisma } from '@/lib/prisma';
import { getTestApp } from './helpers/app';
import { authorization, registerTestUser } from './helpers/auth';

const payload = {
  category: 'BUG',
  subject: 'Calendar skips a day',
  message: 'The diary calendar skips the selected date after navigation.',
  sourcePath: '/app/diary',
  appVersion: '0.2.0',
};

const promote = async (userId: string) => prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } });

const createFeedback = async (user: Awaited<ReturnType<typeof registerTestUser>>, overrides = {}) =>
  request(await getTestApp())
    .post('/api/feedback')
    .set('Authorization', authorization(user))
    .send({ ...payload, ...overrides })
    .expect(201);

describe('feedback routes', () => {
  it('requires authentication and validates submissions', async () => {
    await request(await getTestApp()).post('/api/feedback').send(payload).expect(401);
    const user = await registerTestUser('feedback-validation');
    const response = await request(await getTestApp()).post('/api/feedback').set('Authorization', authorization(user)).send({ ...payload, subject: '', message: '' }).expect(400);
    expect(response.body.fieldErrors).toMatchObject({ subject: expect.any(String), message: expect.any(String) });
  });

  it('creates, lists, and reads only the current user feedback', async () => {
    const owner = await registerTestUser('feedback-owner');
    const outsider = await registerTestUser('feedback-outsider');
    const created = await createFeedback(owner);

    expect(created.body.data).toMatchObject({ category: 'BUG', status: 'NEW', subject: payload.subject });
    expect(created.body.data).not.toHaveProperty('userId');

    const list = await request(await getTestApp())
      .get('/api/feedback?page=1&limit=10')
      .set('Authorization', authorization(owner))
      .expect(200);
    expect(list.body.pagination.total).toBe(1);
    expect(list.body.data[0]).not.toHaveProperty('message');

    await request(await getTestApp())
      .get(`/api/feedback/${created.body.data.id}`)
      .set('Authorization', authorization(outsider))
      .expect(404);
  });

  it('restricts admin triage and supports filters, search, and updates', async () => {
    const owner = await registerTestUser('feedback-submitter');
    const admin = await registerTestUser('feedback-admin');
    await promote(admin.userId);
    const created = await createFeedback(owner);

    await request(await getTestApp())
      .get('/api/admin/feedback')
      .set('Authorization', authorization(owner))
      .expect(403);

    const list = await request(await getTestApp())
      .get('/api/admin/feedback?status=NEW&category=BUG&query=submitter&page=1&limit=20')
      .set('Authorization', authorization(admin))
      .expect(200);
    expect(list.body.pagination.total).toBe(1);
    expect(list.body.data[0]).toMatchObject({ username: owner.username, subject: payload.subject });
    expect(list.body.data[0]).not.toHaveProperty('message');

    const updated = await request(await getTestApp())
      .patch(`/api/admin/feedback/${created.body.data.id}`)
      .set('Authorization', authorization(admin))
      .send({ status: 'NEW', adminResponse: 'Thanks, we are investigating.' })
      .expect(200);
    expect(updated.body.data).toMatchObject({ status: 'ACKNOWLEDGED', adminResponse: 'Thanks, we are investigating.' });
    expect(updated.body.data.acknowledgedAt).toEqual(expect.any(String));
    expect(await prisma.notification.count({ where: { userId: owner.userId, type: 'FEEDBACK_STATUS_CHANGED' } })).toBe(1);

    await request(await getTestApp())
      .patch(`/api/admin/feedback/${created.body.data.id}`)
      .set('Authorization', authorization(admin))
      .send({ status: 'ACKNOWLEDGED' })
      .expect(200);
    expect(await prisma.notification.count({ where: { userId: owner.userId, type: 'FEEDBACK_STATUS_CHANGED' } })).toBe(1);

    const completed = await request(await getTestApp())
      .patch(`/api/admin/feedback/${created.body.data.id}`)
      .set('Authorization', authorization(admin))
      .send({ status: 'COMPLETED' })
      .expect(200);
    expect(completed.body.data.resolvedAt).toEqual(expect.any(String));
    expect(await prisma.notification.count({ where: { userId: owner.userId, type: 'FEEDBACK_STATUS_CHANGED' } })).toBe(2);
  });

  it('keeps transition timestamps and status notifications idempotent across terminal changes', async () => {
    const owner = await registerTestUser('feedback-transition-owner');
    const admin = await registerTestUser('feedback-transition-admin');
    await promote(admin.userId);
    const created = await createFeedback(owner, { subject: 'Transition matrix' });
    const id = created.body.data.id as string;
    const update = async (status: string) =>
      request(await getTestApp()).patch(`/api/admin/feedback/${id}`).set('Authorization', authorization(admin)).send({ status }).expect(200);

    const completed = await update('COMPLETED');
    expect(completed.body.data).toMatchObject({ status: 'COMPLETED' });
    expect(completed.body.data.acknowledgedAt).toEqual(expect.any(String));
    expect(completed.body.data.resolvedAt).toEqual(expect.any(String));

    const repeatedCompleted = await update('COMPLETED');
    expect(repeatedCompleted.body.data.resolvedAt).toBe(completed.body.data.resolvedAt);

    const notPlanned = await update('NOT_PLANNED');
    expect(notPlanned.body.data).toMatchObject({ status: 'NOT_PLANNED' });
    expect(notPlanned.body.data.acknowledgedAt).toBe(completed.body.data.acknowledgedAt);
    const repeatedNotPlanned = await update('NOT_PLANNED');
    expect(repeatedNotPlanned.body.data.resolvedAt).toBe(notPlanned.body.data.resolvedAt);

    const reopened = await update('ACKNOWLEDGED');
    expect(reopened.body.data.resolvedAt).toBeNull();
    const reentered = await update('NOT_PLANNED');
    expect(reentered.body.data.resolvedAt).toEqual(expect.any(String));
    await update('COMPLETED');

    const notifications = await prisma.notification.findMany({
      where: { userId: owner.userId, type: 'FEEDBACK_STATUS_CHANGED' },
      orderBy: { dedupeKey: 'asc' },
      select: { dedupeKey: true },
    });
    expect(notifications).toEqual([
      { dedupeKey: `feedback:${id}:ACKNOWLEDGED` },
      { dedupeKey: `feedback:${id}:COMPLETED` },
      { dedupeKey: `feedback:${id}:NOT_PLANNED` },
    ]);
  });

});
