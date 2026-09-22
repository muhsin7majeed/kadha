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

export interface AdminFeedbackListParams {
  page: number;
  limit: number;
  query: string;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  sort: 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}
