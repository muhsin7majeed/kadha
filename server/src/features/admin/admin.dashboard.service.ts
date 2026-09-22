import { UserRole } from '@prisma/client';

import { envConfig } from '@/config/env';
import { getRecordedActivitySummary } from '@/features/activity/activity.service';
import { getAdminFeedbackAttentionSummary } from '@/features/feedback/feedback.service';
import { getProviderUsageReport } from '@/features/provider-usage/provider-usage.service';
import { prisma } from '@/lib/prisma';
import type { AdminOverview, AdminOverviewProvider, AdminOverviewTrendPoint } from './admin.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const PROVIDER_RANGE_MS = DAY_MS;
const TREND_DAYS = 30;

const trackedMediaWhere = {
  OR: [{ watched: true }, { liked: true }, { watchlist: true }],
};

const subtractDays = (date: Date, days: number) => new Date(date.getTime() - days * DAY_MS);

const startOfUtcDay = (date: Date) => {
  const day = new Date(date);
  day.setUTCHours(0, 0, 0, 0);
  return day;
};

const buildUserTrend = (
  now: Date,
  newUsers: Array<{ createdAt: Date }>,
  recordedActivity: Awaited<ReturnType<typeof getRecordedActivitySummary>>,
): AdminOverviewTrendPoint[] => {
  const newUsersByDate = new Map<string, number>();
  const activeUsersByDate = new Map(recordedActivity.daily.map((point) => [point.date, point.userCount]));

  newUsers.forEach((user) => {
    const date = user.createdAt.toISOString().slice(0, 10);
    newUsersByDate.set(date, (newUsersByDate.get(date) ?? 0) + 1);
  });

  const firstDay = subtractDays(startOfUtcDay(now), TREND_DAYS - 1);

  return Array.from({ length: TREND_DAYS }, (_, index) => {
    const date = new Date(firstDay.getTime() + index * DAY_MS).toISOString().slice(0, 10);
    return {
      date,
      newUsers: newUsersByDate.get(date) ?? 0,
      recordedActiveUsers: activeUsersByDate.get(date) ?? 0,
    };
  });
};

type ProviderUsageLoader = typeof getProviderUsageReport;

export const getAdminProviderHealth = async (
  now: Date,
  loadProviderUsage: ProviderUsageLoader = getProviderUsageReport,
): Promise<AdminOverviewProvider> => {
  try {
    const report = await loadProviderUsage({
      from: new Date(now.getTime() - PROVIDER_RANGE_MS),
      to: now,
    });

    return {
      status: 'available',
      range: '24h',
      from: report.from,
      to: report.to,
      summary: report.summary,
    };
  } catch (error) {
    console.error('Failed to load provider health for admin overview', error);
    return { status: 'unavailable', range: '24h' };
  }
};

export async function getAdminOverview(): Promise<AdminOverview> {
  const now = new Date();
  const sevenDaysAgo = subtractDays(now, 7);
  const thirtyDaysAgo = subtractDays(now, 30);
  const trendStart = subtractDays(startOfUtcDay(now), TREND_DAYS - 1);

  const [core, feedback, recordedActivity, provider] = await Promise.all([
    prisma.$transaction(async (tx) => {
      const [
        totalUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        totalTrackedMediaRows,
        totalCollections,
        totalFriendships,
        totalNotifications,
        totalAdmins,
        newUserDates,
      ] = await Promise.all([
        tx.user.count(),
        tx.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
        tx.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
        tx.userMedia.count({ where: trackedMediaWhere }),
        tx.collection.count(),
        tx.friendship.count({ where: { status: 'ACCEPTED' } }),
        tx.notification.count(),
        tx.user.count({ where: { role: UserRole.ADMIN } }),
        tx.user.findMany({
          where: { createdAt: { gte: trendStart, lt: now } },
          select: { createdAt: true },
        }),
      ]);

      return {
        totalUsers,
        newUsersLast7Days,
        newUsersLast30Days,
        totalTrackedMediaRows,
        totalCollections,
        totalFriendships,
        totalNotifications,
        totalAdmins,
        newUserDates,
      };
    }),
    getAdminFeedbackAttentionSummary(),
    getRecordedActivitySummary(thirtyDaysAgo, sevenDaysAgo, now),
    getAdminProviderHealth(now),
  ]);

  return {
    totalUsers: core.totalUsers,
    newUsersLast7Days: core.newUsersLast7Days,
    newUsersLast30Days: core.newUsersLast30Days,
    totalTrackedMediaRows: core.totalTrackedMediaRows,
    totalCollections: core.totalCollections,
    totalFriendships: core.totalFriendships,
    totalNotifications: core.totalNotifications,
    totalAdmins: core.totalAdmins,
    appName: envConfig.appName,
    appVersion: envConfig.version,
    generatedAt: now.toISOString(),
    users: {
      total: core.totalUsers,
      newLast7Days: core.newUsersLast7Days,
      newLast30Days: core.newUsersLast30Days,
      recordedActiveLast7Days: recordedActivity.recentDistinctUserCount,
      recordedActiveLast30Days: recordedActivity.distinctUserCount,
      trend: buildUserTrend(now, core.newUserDates, recordedActivity),
    },
    feedback,
    provider,
    instanceData: {
      trackedMediaRows: core.totalTrackedMediaRows,
      collections: core.totalCollections,
      acceptedFriendships: core.totalFriendships,
      admins: core.totalAdmins,
    },
  };
}
