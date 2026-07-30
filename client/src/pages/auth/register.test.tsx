import { screen, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RegisterInputs, RegisterResponse } from '@/features/auth/auth.types';
import { queryClient } from '@/lib/query-client';
import { renderWithProviders } from '@/test/render';
import Register from './register';

const registration = vi.hoisted(() => ({
  getMe: vi.fn(),
  mutate: vi.fn<
    (
      payload: RegisterInputs,
      options: {
        onSuccess: (data: RegisterResponse) => void;
      },
    ) => void
  >(),
  reset: vi.fn(),
  setAccessToken: vi.fn(),
}));

vi.mock('@/features/auth/api/use-register', () => ({
  default: () => ({
    error: null,
    isPending: false,
    mutate: registration.mutate,
    reset: registration.reset,
  }),
}));

vi.mock('@/features/user/api/use-get-me', () => ({
  getMe: registration.getMe,
}));

vi.mock('@/lib/token-manager', () => ({
  setAccessToken: registration.setAccessToken,
}));

vi.mock('@/pages/auth/auth-form', () => ({
  default: ({ onSubmit }: { onSubmit: (payload: RegisterInputs) => void }) => (
    <button
      type="button"
      onClick={() =>
        onSubmit({
          username: 'movie-fan',
          password: 'password123',
          confirmPassword: 'password123',
          watchRegion: 'US',
        })
      }
    >
      Submit registration
    </button>
  ),
}));

describe('Register', () => {
  beforeEach(() => {
    registration.getMe.mockResolvedValue({
      id: 'user-id',
      username: 'movie-fan',
    });
    registration.mutate.mockImplementation((_payload, options) => {
      options.onSuccess({
        message: 'User registered successfully',
        accessToken: 'access-token',
        recoveryCode: 'KADHA-72F9-AC41-8D30-19BE-55C2-A911-04DF',
        userId: 'user-id',
      });
    });
    vi.clearAllMocks();
  });

  it('requires the recovery code to be saved before completing the authenticated session', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/auth/register']}>
          <Register />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Submit registration' }));

    expect(screen.getByLabelText('Account recovery code')).toBeInTheDocument();
    expect(registration.setAccessToken).not.toHaveBeenCalled();
    expect(registration.reset).toHaveBeenCalledOnce();

    const continueButton = screen.getByRole('button', {
      name: 'Continue to Kadha',
    });
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: /I saved my recovery code/i }));
    await user.click(continueButton);

    await waitFor(() => {
      expect(registration.setAccessToken).toHaveBeenCalledWith('access-token');
      expect(registration.getMe).toHaveBeenCalled();
    });
  });
});
