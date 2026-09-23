import { DataPrivacy, FeedbackCategory, FeedbackStatus, UserRole } from '@prisma/client';

import type { ProviderUsageSummary } from '@/features/provider-usage/provider-usage.types';

export type AdminUserSort = 'username' | 'createdAt' | 'updatedAt';
export type AdminSortOrder = 'asc' | 'desc';

export interface AdminOverviewTrendPoint {
  date: string;
  newUsers: number;
  recordedActiveUsers: number;
}

export interface AdminOverviewFeedbackItem {
  id: string;
  category: FeedbackCategory;
  subject: string;
  status: FeedbackStatus;
  username: string;
  createdAt: Date;
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
    recentOpen: AdminOverviewFeedbackItem[];
  };
  provider: AdminOverviewProvider;
  instanceData: {
    trackedMediaRows: number;
    collections: number;
    acceptedFriendships: number;
    admins: number;
  };
}

export interface AdminUserListParams {
  page: number;
  limit: number;
  query: string;
  sort: AdminUserSort;
  order: AdminSortOrder;
  role?: UserRole;
}

export interface AdminUserSummary {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
}

export interface AdminUserDetail {
  id: string;
  username: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
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
