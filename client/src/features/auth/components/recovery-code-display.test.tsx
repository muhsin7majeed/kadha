import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';
import RecoveryCodeDisplay from './recovery-code-display';

const recoveryCode = 'KADHA-72F9-AC41-8D30-19BE-55C2-A911-04DF';

describe('RecoveryCodeDisplay', () => {
  const writeText = vi.fn<(value: string) => Promise<void>>();

  beforeEach(() => {
    writeText.mockResolvedValue();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
  });

  it('requires confirmation before continuing and copies the code', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderWithProviders(
      <RecoveryCodeDisplay
        continueLabel="Continue"
        generatedAt={new Date('2026-07-30T12:00:00.000Z')}
        recoveryCode={recoveryCode}
        username="movie-fan"
        onContinue={onContinue}
      />,
    );

    const continueButton = screen.getByRole('button', { name: 'Continue' });

    expect(screen.getByLabelText('Account recovery code')).toHaveTextContent(recoveryCode);
    expect(continueButton).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(writeText).toHaveBeenCalledWith(recoveryCode);

    await user.click(screen.getByRole('checkbox', { name: /I saved my recovery code/i }));
    expect(continueButton).toBeEnabled();

    await user.click(continueButton);
    expect(onContinue).toHaveBeenCalledOnce();
  });
});
