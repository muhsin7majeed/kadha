import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { queryKeys } from '@/lib/query-keys';

const mocks = vi.hoisted(() => ({ status: 'unauthenticated', get: vi.fn() }));
vi.mock('@/features/auth/use-auth', () => ({
  useAuth: () => ({ status: mocks.status, user: null }),
}));
vi.mock('@/lib/axios-instance', () => ({ default: { get: mocks.get } }));

import useMediaCardPreferences from './use-media-card-preferences';

describe('useMediaCardPreferences', () => {
  beforeEach(() => {
    mocks.status = 'unauthenticated';
    mocks.get.mockReset();
  });

  it('does not request or reveal cached account settings to a guest', () => {
    const client = new QueryClient();
    client.setQueryData(queryKeys.mediaCardPreferences, { version: 1, style: 'minimal' });
    const { result } = renderHook(() => useMediaCardPreferences(), {
      wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    });
    expect(result.current.data).toBeUndefined();
    expect(mocks.get).not.toHaveBeenCalled();
    client.clear();
  });

  it('loads the account setting when authenticated', async () => {
    mocks.status = 'authenticated';
    mocks.get.mockResolvedValue({ data: { data: { version: 1, style: 'minimal' } } });
    const client = new QueryClient();
    const { result } = renderHook(() => useMediaCardPreferences(), {
      wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
    });
    await waitFor(() => expect(result.current.data?.style).toBe('minimal'));
    expect(mocks.get).toHaveBeenCalledWith('/api/media-card-preferences');
    client.clear();
  });
});
