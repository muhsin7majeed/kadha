import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';

import { Provider } from '@/components/ui/provider';

export const renderWithProviders = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: Provider, ...options });
