export type PwaInstallMethod = 'native' | 'ios';

export type PwaInstallOutcome = 'accepted' | 'dismissed';

export interface PwaInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: PwaInstallOutcome;
    platform: string;
  }>;
}

export interface PwaDeviceDetails {
  maxTouchPoints: number;
  platform: string;
  userAgent: string;
}

export const isIosDevice = ({ maxTouchPoints, platform, userAgent }: PwaDeviceDetails) =>
  /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1);

export const isStandalonePwa = (displayModeStandalone: boolean, navigatorStandalone = false) =>
  displayModeStandalone || navigatorStandalone;
