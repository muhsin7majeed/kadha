import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { PwaInstallPromptEvent } from './pwa-install.types';
import { PwaInstallProvider } from './pwa-install-provider';
import { usePwaInstall } from './use-pwa-install';

const InstallConsumer = () => {
  const { installMethod, requestInstall } = usePwaInstall();

  return (
    <>
      <span>{installMethod ?? 'unavailable'}</span>
      <button type="button" onClick={() => void requestInstall()}>
        Install
      </button>
    </>
  );
};

const createInstallPromptEvent = (prompt: () => Promise<void>) => {
  const event = new Event('beforeinstallprompt', { cancelable: true }) as PwaInstallPromptEvent;

  Object.assign(event, {
    prompt,
    userChoice: Promise.resolve({
      outcome: 'accepted',
      platform: 'web',
    }),
  });

  return event;
};

describe('PwaInstallProvider', () => {
  it('captures the native install prompt and consumes it after use', async () => {
    const user = userEvent.setup();
    const prompt = vi.fn().mockResolvedValue(undefined);

    render(
      <PwaInstallProvider>
        <InstallConsumer />
      </PwaInstallProvider>,
    );

    expect(screen.getByText('unavailable')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(createInstallPromptEvent(prompt));
    });

    expect(screen.getByText('native')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Install' }));

    expect(prompt).toHaveBeenCalledOnce();
    expect(await screen.findByText('unavailable')).toBeInTheDocument();
  });

  it('removes the install action after the browser reports installation', () => {
    render(
      <PwaInstallProvider>
        <InstallConsumer />
      </PwaInstallProvider>,
    );

    act(() => {
      window.dispatchEvent(createInstallPromptEvent(vi.fn().mockResolvedValue(undefined)));
    });

    expect(screen.getByText('native')).toBeInTheDocument();

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(screen.getByText('unavailable')).toBeInTheDocument();
  });
});
