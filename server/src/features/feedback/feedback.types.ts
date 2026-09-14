import type { FeedbackCategory, FeedbackStatus } from '@prisma/client';

export interface AdminFeedbackListParams {
  page: number;
  limit: number;
  query: string;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  sort: 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}
