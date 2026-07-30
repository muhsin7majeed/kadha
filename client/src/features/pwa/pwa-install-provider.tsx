import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { PwaInstallContext } from './pwa-install-context';
import {
  isIosDevice,
  isStandalonePwa,
  type PwaInstallMethod,
  type PwaInstallOutcome,
  type PwaInstallPromptEvent,
} from './pwa-install.types';

interface PwaInstallProviderProps {
  children: ReactNode;
}

type NavigatorWithStandalone = Navigator & {
  readonly standalone?: boolean;
};

const getStandaloneState = () => {
  const navigatorStandalone = (navigator as NavigatorWithStandalone).standalone === true;
  return isStandalonePwa(window.matchMedia('(display-mode: standalone)').matches, navigatorStandalone);
};

export const PwaInstallProvider = ({ children }: PwaInstallProviderProps) => {
  const [installPrompt, setInstallPrompt] = useState<PwaInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(getStandaloneState);

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)');

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as PwaInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    const handleDisplayModeChange = () => {
      setIsInstalled(getStandaloneState());
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    displayMode.addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      displayMode.removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  const installMethod = useMemo<PwaInstallMethod | null>(() => {
    if (isInstalled) return null;
    if (installPrompt) return 'native';

    return isIosDevice({
      maxTouchPoints: navigator.maxTouchPoints,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    })
      ? 'ios'
      : null;
  }, [installPrompt, isInstalled]);

  const requestInstall = async (): Promise<PwaInstallOutcome | null> => {
    if (!installPrompt) return null;

    try {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      return outcome;
    } catch {
      return null;
    } finally {
      setInstallPrompt(null);
    }
  };

  return <PwaInstallContext.Provider value={{ installMethod, requestInstall }}>{children}</PwaInstallContext.Provider>;
};
