import { Menu } from '@chakra-ui/react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/render';

import { PwaInstallContext, type PwaInstallContextValue } from './pwa-install-context';
import PwaInstallMenuItem from './pwa-install-menu-item';

const renderInstallItem = (value: PwaInstallContextValue) =>
  renderWithProviders(
    <PwaInstallContext.Provider value={value}>
      <Menu.Root open>
        <Menu.Content>
          <PwaInstallMenuItem />
        </Menu.Content>
      </Menu.Root>
    </PwaInstallContext.Provider>,
  );

describe('PwaInstallMenuItem', () => {
  it('opens platform-specific Home Screen instructions on iOS', async () => {
    const user = userEvent.setup();
    const requestInstall = vi.fn().mockResolvedValue(null);

    renderInstallItem({ installMethod: 'ios', requestInstall });

    await user.click(screen.getByRole('menuitem', { name: 'Install Kadha' }));

    expect(screen.getByRole('dialog', { name: 'Install Kadha' })).toBeInTheDocument();
    expect(screen.getByText('Choose Add to Home Screen.')).toBeInTheDocument();
    expect(screen.getByText(/still needs a connection/i)).toBeInTheDocument();
    expect(requestInstall).not.toHaveBeenCalled();
  });

  it('uses the browser install prompt when it is available', async () => {
    const user = userEvent.setup();
    const requestInstall = vi.fn().mockResolvedValue('accepted');

    renderInstallItem({ installMethod: 'native', requestInstall });

    await user.click(screen.getByRole('menuitem', { name: 'Install Kadha' }));

    expect(requestInstall).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog', { name: 'Install Kadha' })).not.toBeInTheDocument();
  });
});
