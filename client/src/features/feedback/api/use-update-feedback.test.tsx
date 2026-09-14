import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';
import useUpdateFeedback from './use-update-feedback';

const mocks = vi.hoisted(() => ({ invalidateQueries: vi.fn(), mutationOptions: undefined as unknown as { onSuccess: (data: unknown, input: { id: string }) => void } }));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
    useMutation: (options: typeof mocks.mutationOptions) => {
      mocks.mutationOptions = options;
      return { mutateAsync: vi.fn(), isPending: false };
    },
  };
});

vi.mock('@/components/ui/toaster-store', () => ({ toaster: { success: vi.fn() } }));

describe('useUpdateFeedback', () => {
  beforeEach(() => vi.clearAllMocks());

  it('invalidates admin, owner, and notification caches after an update', () => {
    renderHook(() => useUpdateFeedback());
    mocks.mutationOptions.onSuccess({}, { id: 'feedback-1' });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.adminFeedbackRoot });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.feedbackRoot });
    expect(mocks.invalidateQueries).toHaveBeenCalledWith({ queryKey: queryKeys.notifications });
  });
});
