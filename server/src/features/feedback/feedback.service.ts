import { FeedbackStatus, Prisma } from '@prisma/client';

import { notFound } from '@/lib/http';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import type { CreateFeedbackInput, UpdateFeedbackInput } from './feedback.schema';
import type { AdminFeedbackListParams } from './feedback.types';

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
  return prisma.feedback.create({
    data: {
      userId,
      category: input.category,
      subject: input.subject,
      message: input.message,
      sourcePath: input.sourcePath || null,
      appVersion: input.appVersion || null,
    },
    select: userSummarySelect,
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

export async function getAdminFeedback(params: AdminFeedbackListParams) {
  const where: Prisma.FeedbackWhereInput = {
    ...(params.category ? { category: params.category } : {}),
    ...(params.status ? { status: params.status } : {}),
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
  const [items, total] = await prisma.$transaction([
    prisma.feedback.findMany({
      where,
      select: adminSummarySelect,
      skip,
      take: params.limit,
      orderBy: { [params.sort]: params.order },
    }),
    prisma.feedback.count({ where }),
  ]);
  return { data: items.map(toAdminSummary), pagination: createPaginationMeta(params.page, params.limit, total) };
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
  const current = await prisma.feedback.findUnique({ where: { id } });
  if (!current) throw notFound('Feedback not found');

  const adminResponse = input.adminResponse === undefined ? undefined : input.adminResponse || null;
  const status = input.status ?? (adminResponse && current.status === FeedbackStatus.NEW ? FeedbackStatus.ACKNOWLEDGED : undefined);
  const nextStatus = status ?? current.status;
  const now = new Date();

  const updated = await prisma.feedback.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(adminResponse !== undefined ? { adminResponse } : {}),
      ...(nextStatus === FeedbackStatus.ACKNOWLEDGED && !current.acknowledgedAt ? { acknowledgedAt: now } : {}),
      ...(nextStatus === FeedbackStatus.COMPLETED || nextStatus === FeedbackStatus.NOT_PLANNED
        ? { resolvedAt: current.status === nextStatus ? current.resolvedAt : now }
        : { resolvedAt: null }),
    },
    include: { user: { select: { username: true } } },
  });
  const { userId: _userId, user, ...data } = updated;
  return { ...data, username: user.username };
}
