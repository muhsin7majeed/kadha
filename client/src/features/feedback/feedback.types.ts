import type { PaginatedResponse } from '@/types/common';

export type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'GENERAL';
export type FeedbackStatus = 'NEW' | 'ACKNOWLEDGED' | 'COMPLETED' | 'NOT_PLANNED';
export type AdminFeedbackStatusFilter = FeedbackStatus | 'OPEN' | 'ALL';

export interface FeedbackSummary {
  id: string;
  category: FeedbackCategory;
  subject: string;
  status: FeedbackStatus;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  username?: string;
  sourcePath?: string | null;
  appVersion?: string | null;
}

export interface Feedback extends FeedbackSummary {
  message: string;
  sourcePath: string | null;
  appVersion: string | null;
  adminResponse: string | null;
}

export interface CreateFeedbackInput {
  category: FeedbackCategory;
  subject: string;
  message: string;
  sourcePath?: string;
  appVersion?: string;
}

export interface AdminFeedbackStatusSummary {
  newCount: number;
  openCount: number;
  acknowledgedCount: number;
  completedCount: number;
  notPlannedCount: number;
}

export interface AdminFeedbackResponse extends PaginatedResponse<FeedbackSummary[]> {
  summary: AdminFeedbackStatusSummary;
}

export interface AdminFeedbackParams {
  page: number;
  limit: number;
  query: string;
  category: FeedbackCategory | 'ALL';
  status: AdminFeedbackStatusFilter;
  sort: 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

export interface UpdateFeedbackInput {
  id: string;
  status?: FeedbackStatus;
  adminResponse?: string | null;
}
