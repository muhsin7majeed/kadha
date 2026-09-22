import type { FeedbackCategory, FeedbackStatus } from '@prisma/client';

export interface AdminFeedbackAttentionSummary {
  newCount: number;
  openCount: number;
  recentOpen: Array<{
    id: string;
    category: FeedbackCategory;
    subject: string;
    status: FeedbackStatus;
    username: string;
    createdAt: Date;
  }>;
}

export interface AdminFeedbackStatusSummary {
  newCount: number;
  openCount: number;
  acknowledgedCount: number;
  completedCount: number;
  notPlannedCount: number;
}

export interface AdminFeedbackListParams {
  page: number;
  limit: number;
  query: string;
  category?: FeedbackCategory;
  status?: FeedbackStatus | 'OPEN';
  sort: 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}
