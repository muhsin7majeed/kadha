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
    const secondAdmin = await registerTestUser('feedback-second-admin');
    await promote(admin.userId);
    await promote(secondAdmin.userId);
    const created = await createFeedback(owner);

    await request(await getTestApp())
      .get('/api/admin/feedback')
      .set('Authorization', authorization(owner))
      .expect(403);

    const feedbackNotifications = await prisma.notification.findMany({
      where: { type: 'FEEDBACK_SUBMITTED', entityId: created.body.data.id },
      orderBy: { userId: 'asc' },
    });
    expect(feedbackNotifications).toHaveLength(2);
    expect(feedbackNotifications).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: admin.userId, actorId: owner.userId, metadata: JSON.stringify({ subject: payload.subject }) }),
        expect.objectContaining({ userId: secondAdmin.userId, actorId: owner.userId, metadata: JSON.stringify({ subject: payload.subject }) }),
      ]),
    );

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

  it('returns status counts and treats new and acknowledged feedback as open', async () => {
    const owner = await registerTestUser('feedback-inbox-owner');
    const admin = await registerTestUser('feedback-inbox-admin');
    await promote(admin.userId);

    const newFeedback = await createFeedback(owner, { subject: 'New inbox item' });
    const acknowledgedFeedback = await createFeedback(owner, { subject: 'Acknowledged inbox item' });
    const completedFeedback = await createFeedback(owner, { subject: 'Completed inbox item' });
    const notPlannedFeedback = await createFeedback(owner, { subject: 'Not planned inbox item' });

    const update = async (id: string, status: string) =>
      request(await getTestApp())
        .patch(`/api/admin/feedback/${id}`)
        .set('Authorization', authorization(admin))
        .send({ status })
        .expect(200);

    await update(acknowledgedFeedback.body.data.id, 'ACKNOWLEDGED');
    await update(completedFeedback.body.data.id, 'COMPLETED');
    await update(notPlannedFeedback.body.data.id, 'NOT_PLANNED');

    const response = await request(await getTestApp())
      .get('/api/admin/feedback?status=OPEN&page=1&limit=20')
      .set('Authorization', authorization(admin))
      .expect(200);

    expect(response.body.summary).toEqual({
      newCount: 1,
      openCount: 2,
      acknowledgedCount: 1,
      completedCount: 1,
      notPlannedCount: 1,
    });
    expect(response.body.data.map((item: { id: string }) => item.id)).toEqual(
      expect.arrayContaining([newFeedback.body.data.id, acknowledgedFeedback.body.data.id]),
    );
    expect(response.body.data).toHaveLength(2);
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
