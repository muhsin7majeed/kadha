import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { RegisterInputs } from '@/features/auth/auth.types';
import { renderWithProviders } from '@/test/render';
import AuthForm from './auth-form';

vi.mock('@/features/auth/password-strength', () => ({
  estimatePasswordStrength: vi.fn().mockResolvedValue({ score: 4 }),
}));

describe('AuthForm', () => {
  it('uses password-manager-compatible fields and accessible password visibility controls', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthForm type="login" onSubmit={vi.fn()} />);

    const username = screen.getByRole('textbox', { name: 'Username' });
    const password = screen.getByLabelText('Password');

    expect(username).toHaveAttribute('autocomplete', 'username');
    expect(password).toHaveAttribute('autocomplete', 'current-password');
    expect(password).toHaveAttribute('type', 'password');

    await user.click(screen.getByRole('button', { name: 'Show password' }));

    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('allows an eight-character password while presenting optional safety guidance', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn<(values: RegisterInputs) => void>();

    renderWithProviders(<AuthForm type="register" onSubmit={onSubmit} />);

    const username = screen.getByRole('textbox', { name: 'Username' });
    const password = screen.getByLabelText('Password');
    const confirmPassword = screen.getByLabelText('Confirm password');

    expect(password).toHaveAttribute('autocomplete', 'new-password');
    expect(confirmPassword).toHaveAttribute('autocomplete', 'new-password');

    await user.type(username, 'movie-fan');
    await user.type(password, 'password');
    await user.type(confirmPassword, 'password');

    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('Uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('Number')).toBeInTheDocument();
    expect(screen.getByText('Symbol')).toBeInTheDocument();
    expect(screen.getByText('Only 8 characters are required. The other suggestions are optional.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'movie-fan',
          password: 'password',
          confirmPassword: 'password',
        }),
        expect.anything(),
      );
    });
  });

  it('announces API failures within the form', () => {
    renderWithProviders(
      <AuthForm type="login" apiError="Too many login attempts. Try again later." onSubmit={vi.fn()} />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Too many login attempts. Try again later.');
  });

  it('associates registration validation errors with their fields', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthForm type="register" onSubmit={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Register' }));

    const password = screen.getByLabelText('Password');
    const passwordError = await screen.findByText('Password is required');

    expect(password).toHaveAttribute('aria-invalid', 'true');
    expect(password.getAttribute('aria-describedby')).toContain(passwordError.id);
    expect(password.getAttribute('aria-describedby')).toContain('registration-password-guidance');
  });
});
