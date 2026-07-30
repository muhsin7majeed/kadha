import { createContext } from 'react';

import type { PwaInstallMethod, PwaInstallOutcome } from './pwa-install.types';

export interface PwaInstallContextValue {
  installMethod: PwaInstallMethod | null;
  requestInstall: () => Promise<PwaInstallOutcome | null>;
}

export const PwaInstallContext = createContext<PwaInstallContextValue | null>(null);
