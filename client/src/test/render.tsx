import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

import { Provider } from '@/components/ui/provider';
import { PwaInstallProvider } from '@/features/pwa/pwa-install-provider';

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, {
    wrapper: ({ children }) => (
      <PwaInstallProvider>
        <Provider>{children}</Provider>
      </PwaInstallProvider>
    ),
    ...options,
  });
