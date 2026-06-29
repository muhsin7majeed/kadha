import { DataPrivacy, UserRole } from '@/types/common';

export type AdminUserSort = 'username' | 'createdAt' | 'updatedAt';
export type AdminSortOrder = 'asc' | 'desc';
export type AdminRoleFilter = UserRole | 'ALL';

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
}

export interface AdminUserDetail extends AdminUserSummary {
  pendingSentFriendRequestCount: number;
  pendingReceivedFriendRequestCount: number;
}
