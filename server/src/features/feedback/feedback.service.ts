import { FeedbackStatus, Prisma, UserRole } from '@prisma/client';

import { notFound } from '@/lib/http';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { createNotification } from '@/features/notification/notification.service';
import { NotificationType } from '@/types/common';
import type { CreateFeedbackInput, UpdateFeedbackInput } from './feedback.schema';
import type {
  AdminFeedbackAttentionSummary,
  AdminFeedbackListParams,
  AdminFeedbackStatusSummary,
} from './feedback.types';

const openStatuses = [FeedbackStatus.NEW, FeedbackStatus.ACKNOWLEDGED];

const userSummarySelect = {
  id: true,
  category: true,
  subject: true,
  status: true,
  acknowledgedAt: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FeedbackSelect;

const adminSummarySelect = {
  ...userSummarySelect,
  sourcePath: true,
  appVersion: true,
  user: { select: { username: true } },
} satisfies Prisma.FeedbackSelect;

const toAdminSummary = (feedback: Prisma.FeedbackGetPayload<{ select: typeof adminSummarySelect }>) => ({
  ...feedback,
  username: feedback.user.username,
  user: undefined,
});

export async function createFeedback(userId: string, input: CreateFeedbackInput) {
  return prisma.$transaction(async (tx) => {
    const feedback = await tx.feedback.create({
      data: {
        userId,
        category: input.category,
        subject: input.subject,
        message: input.message ?? '',
        sourcePath: input.sourcePath || null,
        appVersion: input.appVersion || null,
      },
      select: userSummarySelect,
    });
    const admins = await tx.user.findMany({ where: { role: UserRole.ADMIN }, select: { id: true } });

    for (const admin of admins) {
      await createNotification(
        {
          userId: admin.id,
          type: NotificationType.FeedbackSubmitted,
          actorId: userId,
          entityType: 'feedback',
          entityId: feedback.id,
          metadata: { subject: feedback.subject },
          dedupeKey: `feedback:${feedback.id}:submitted:${admin.id}`,
        },
        tx,
      );
    }

    return feedback;
  });
}

export async function getUserFeedback(userId: string, page: number, limit: number) {
  const where = { userId };
  const skip = (page - 1) * limit;
  const [data, total] = await prisma.$transaction([
    prisma.feedback.findMany({ where, select: userSummarySelect, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.feedback.count({ where }),
  ]);
  return { data, pagination: createPaginationMeta(page, limit, total) };
}

export async function getUserFeedbackItem(userId: string, id: string) {
  const feedback = await prisma.feedback.findFirst({ where: { id, userId } });
  if (!feedback) throw notFound('Feedback not found');
  const { userId: _userId, ...data } = feedback;
  return data;
}

export async function getAdminFeedbackAttentionSummary(limit = 5): Promise<AdminFeedbackAttentionSummary> {
  const [newCount, openCount, recentOpen] = await prisma.$transaction([
    prisma.feedback.count({ where: { status: FeedbackStatus.NEW } }),
    prisma.feedback.count({ where: { status: { in: openStatuses } } }),
    prisma.feedback.findMany({
      where: { status: { in: openStatuses } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        category: true,
        subject: true,
        status: true,
        createdAt: true,
        user: { select: { username: true } },
      },
    }),
  ]);

  return {
    newCount,
    openCount,
    recentOpen: recentOpen.map(({ user, ...feedback }) => ({
      ...feedback,
      username: user.username,
    })),
  };
}

export async function getAdminFeedback(params: AdminFeedbackListParams) {
  const where: Prisma.FeedbackWhereInput = {
    ...(params.category ? { category: params.category } : {}),
    ...(params.status
      ? { status: params.status === 'OPEN' ? { in: openStatuses } : params.status }
      : {}),
    ...(params.query
      ? {
          OR: [
            { subject: { contains: params.query } },
            { message: { contains: params.query } },
            { user: { username: { contains: params.query } } },
          ],
        }
      : {}),
  };
  const skip = (params.page - 1) * params.limit;
  const [items, total, newCount, acknowledgedCount, completedCount, notPlannedCount] = await prisma.$transaction([
    prisma.feedback.findMany({
      where,
      select: adminSummarySelect,
      skip,
      take: params.limit,
      orderBy: { [params.sort]: params.order },
    }),
    prisma.feedback.count({ where }),
    prisma.feedback.count({ where: { status: FeedbackStatus.NEW } }),
    prisma.feedback.count({ where: { status: FeedbackStatus.ACKNOWLEDGED } }),
    prisma.feedback.count({ where: { status: FeedbackStatus.COMPLETED } }),
    prisma.feedback.count({ where: { status: FeedbackStatus.NOT_PLANNED } }),
  ]);
  return {
    data: items.map(toAdminSummary),
    pagination: createPaginationMeta(params.page, params.limit, total),
    summary: {
      newCount,
      openCount: newCount + acknowledgedCount,
      acknowledgedCount,
      completedCount,
      notPlannedCount,
    } satisfies AdminFeedbackStatusSummary,
  };
}

export async function getAdminFeedbackItem(id: string) {
  const feedback = await prisma.feedback.findUnique({
    where: { id },
    include: { user: { select: { username: true } } },
  });
  if (!feedback) throw notFound('Feedback not found');
  const { userId: _userId, user, ...data } = feedback;
  return { ...data, username: user.username };
}

export async function updateFeedback(id: string, input: UpdateFeedbackInput) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.feedback.findUnique({ where: { id } });
    if (!current) throw notFound('Feedback not found');

    const adminResponse = input.adminResponse === undefined ? undefined : input.adminResponse || null;
    const status =
      adminResponse && input.status === FeedbackStatus.NEW
        ? FeedbackStatus.ACKNOWLEDGED
        : (input.status ??
          (adminResponse && current.status === FeedbackStatus.NEW ? FeedbackStatus.ACKNOWLEDGED : undefined));
    const nextStatus = status ?? current.status;
    const now = new Date();
    const firstAcknowledgment = current.acknowledgedAt === null && nextStatus !== FeedbackStatus.NEW;
    const terminalStatus =
      nextStatus === FeedbackStatus.COMPLETED || nextStatus === FeedbackStatus.NOT_PLANNED ? nextStatus : null;

    const updated = await tx.feedback.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(adminResponse !== undefined ? { adminResponse } : {}),
        ...(firstAcknowledgment ? { acknowledgedAt: now } : {}),
        ...(terminalStatus ? { resolvedAt: current.status === terminalStatus ? current.resolvedAt : now } : { resolvedAt: null }),
      },
      include: { user: { select: { username: true } } },
    });

    const notifyOnce = async (notificationStatus: FeedbackStatus) => {
      const dedupeKey = `feedback:${id}:${notificationStatus}`;
      const exists = await tx.notification.findUnique({
        where: { userId_dedupeKey: { userId: current.userId, dedupeKey } },
        select: { id: true },
      });
      if (exists) return;
      await createNotification(
        {
          userId: current.userId,
          type: NotificationType.FeedbackStatusChanged,
          entityType: 'feedback',
          entityId: id,
          metadata: { subject: current.subject, status: notificationStatus },
          dedupeKey,
        },
        tx,
      );
    };

    if (firstAcknowledgment) await notifyOnce(FeedbackStatus.ACKNOWLEDGED);
    if (terminalStatus && current.status !== terminalStatus) await notifyOnce(terminalStatus);

    const { userId: _userId, user, ...data } = updated;
    return { ...data, username: user.username };
  });
}
