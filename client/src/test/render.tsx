import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

import { Provider } from '@/components/ui/provider';
import { PwaInstallProvider } from '@/features/pwa/pwa-install-provider';

const normalizeFocusPrototype = () => {
  const nativeFocus = window.HTMLElement.prototype.focus;
  Object.defineProperty(window.HTMLElement.prototype, 'focus', {
    configurable: true,
    writable: true,
    value: nativeFocus,
  });
};

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  normalizeFocusPrototype();

  return render(ui, {
    wrapper: ({ children }) => (
      <PwaInstallProvider>
        <Provider>{children}</Provider>
      </PwaInstallProvider>
    ),
    ...options,
  });
};
