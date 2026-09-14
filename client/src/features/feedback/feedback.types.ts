export type FeedbackCategory = 'BUG' | 'SUGGESTION' | 'GENERAL';
export type FeedbackStatus = 'NEW' | 'ACKNOWLEDGED' | 'COMPLETED' | 'NOT_PLANNED';

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

export interface AdminFeedbackParams {
  page: number;
  limit: number;
  query: string;
  category: FeedbackCategory | 'ALL';
  status: FeedbackStatus | 'ALL';
  sort: 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

export interface UpdateFeedbackInput {
  id: string;
  status?: FeedbackStatus;
  adminResponse?: string | null;
}
