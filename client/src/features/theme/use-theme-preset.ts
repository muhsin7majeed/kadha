import { createContext, useContext } from 'react';

import type { ThemePreset, ThemePresetId } from './theme.types';

export interface ThemePresetContextValue {
  presetId: ThemePresetId;
  preset: ThemePreset;
  presets: readonly ThemePreset[];
  setPresetId: (presetId: ThemePresetId) => void;
}

export const ThemePresetContext = createContext<ThemePresetContextValue | null>(null);

export const useThemePreset = () => {
  const value = useContext(ThemePresetContext);

  if (!value) {
    throw new Error('useThemePreset must be used within ThemePresetProvider');
  }

  return value;
};
