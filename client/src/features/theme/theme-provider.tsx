import { useEffect, useMemo, useState } from 'react';

import { useColorMode } from '@/components/ui/color-mode';

import {
  applyThemePresetVariables,
  DEFAULT_THEME_PRESET_ID,
  getThemePreset,
  isThemePresetId,
  THEME_PRESETS,
  THEME_PRESET_STORAGE_KEY,
} from './theme-presets';
import type { ThemePresetId } from './theme.types';
import { ThemePresetContext } from './use-theme-preset';

interface ThemePresetProviderProps {
  children: React.ReactNode;
}

const getStoredThemePresetId = (): ThemePresetId => {
  if (typeof window === 'undefined') return DEFAULT_THEME_PRESET_ID;

  const storedPresetId = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);

  return storedPresetId && isThemePresetId(storedPresetId) ? storedPresetId : DEFAULT_THEME_PRESET_ID;
};

export const ThemePresetProvider = ({ children }: ThemePresetProviderProps) => {
  const { colorMode } = useColorMode();
  const activeColorMode = colorMode === 'dark' ? 'dark' : 'light';
  const [presetId, setPresetIdState] = useState<ThemePresetId>(getStoredThemePresetId);

  useEffect(() => {
    applyThemePresetVariables(presetId, activeColorMode);
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, presetId);
  }, [activeColorMode, presetId]);

  const value = useMemo(
    () => ({
      presetId,
      preset: getThemePreset(presetId),
      presets: THEME_PRESETS,
      setPresetId: setPresetIdState,
    }),
    [presetId],
  );

  return <ThemePresetContext.Provider value={value}>{children}</ThemePresetContext.Provider>;
};
