import type { FeedbackCategory, FeedbackStatus } from '@/features/feedback/feedback.types';
import type { ProviderUsageSummary } from '@/features/provider-usage/provider-usage.types';
import { DataPrivacy, UserRole } from '@/types/common';

export type AdminUserSort = 'username' | 'createdAt' | 'updatedAt';
export type AdminSortOrder = 'asc' | 'desc';
export type AdminRoleFilter = UserRole | 'ALL';

export interface AdminOverviewTrendPoint {
  date: string;
  newUsers: number;
  recordedActiveUsers: number;
}

export type AdminOverviewProvider =
  | {
      status: 'available';
      range: '24h';
      from: string;
      to: string;
      summary: ProviderUsageSummary;
    }
  | {
      status: 'unavailable';
      range: '24h';
    };

export interface AdminOverview {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  totalTrackedMediaRows: number;
  totalCollections: number;
  totalFriendships: number;
  totalNotifications: number;
  totalAdmins: number;
  appName: string;
  appVersion: string;
  generatedAt: string;
  users: {
    total: number;
    newLast7Days: number;
    newLast30Days: number;
    recordedActiveLast7Days: number;
    recordedActiveLast30Days: number;
    trend: AdminOverviewTrendPoint[];
  };
  feedback: {
    newCount: number;
    openCount: number;
    recentOpen: Array<{
      id: string;
      category: FeedbackCategory;
      subject: string;
      status: FeedbackStatus;
      username: string;
      createdAt: string;
    }>;
  };
  provider: AdminOverviewProvider;
  instanceData: {
    trackedMediaRows: number;
    collections: number;
    acceptedFriendships: number;
    admins: number;
  };
}

export interface AdminUsersParams {
  page: number;
  limit: number;
  query: string;
  sort: AdminUserSort;
  order: AdminSortOrder;
  role: AdminRoleFilter;
}

export interface AdminUserSummary {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
}

export interface AdminUserDetail {
  id: string;
  username: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profilePrivacy: DataPrivacy;
  watchedPrivacy: DataPrivacy;
  likedPrivacy: DataPrivacy;
  watchlistPrivacy: DataPrivacy;
  watchedCount: number;
  likedCount: number;
  watchlistCount: number;
  collectionCount: number;
  friendCount: number;
  pendingSentFriendRequestCount: number;
  pendingReceivedFriendRequestCount: number;
}
