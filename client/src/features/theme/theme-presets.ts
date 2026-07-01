import type { ThemePreset, ThemePresetId, ThemePresetMode, ThemePresetVariables } from './theme.types';

export const THEME_PRESET_STORAGE_KEY = 'kadha-theme-preset';

export const DEFAULT_THEME_PRESET_ID: ThemePresetId = 'kadha-orange';

export const THEME_PRESET_VARIABLE_NAMES = {
  solid: '--kadha-colors-brand-solid',
  contrast: '--kadha-colors-brand-contrast',
  fg: '--kadha-colors-brand-fg',
  muted: '--kadha-colors-brand-muted',
  subtle: '--kadha-colors-brand-subtle',
  emphasized: '--kadha-colors-brand-emphasized',
  focusRing: '--kadha-colors-brand-focus-ring',
} as const satisfies Record<keyof ThemePresetVariables, string>;

export const THEME_PRESETS = [
  {
    id: 'kadha-orange',
    label: 'Kadha Orange',
    cssVariables: {
      light: {
        solid: '#ea580c',
        contrast: '#ffffff',
        fg: '#92310a',
        muted: '#fed7aa',
        subtle: '#ffedd5',
        emphasized: '#fdba74',
        focusRing: '#ea580c',
      },
      dark: {
        solid: '#f97316',
        contrast: '#111111',
        fg: '#fdba74',
        muted: '#6c2710',
        subtle: '#3b1106',
        emphasized: '#92310a',
        focusRing: '#f97316',
      },
    },
  },
  {
    id: 'ocean-blue',
    label: 'Ocean Blue',
    cssVariables: {
      light: {
        solid: '#2563eb',
        contrast: '#ffffff',
        fg: '#173da6',
        muted: '#bfdbfe',
        subtle: '#dbeafe',
        emphasized: '#a3cfff',
        focusRing: '#2563eb',
      },
      dark: {
        solid: '#3b82f6',
        contrast: '#ffffff',
        fg: '#a3cfff',
        muted: '#1a3478',
        subtle: '#14204a',
        emphasized: '#173da6',
        focusRing: '#3b82f6',
      },
    },
  },
  {
    id: 'forest-green',
    label: 'Forest Green',
    cssVariables: {
      light: {
        solid: '#16a34a',
        contrast: '#ffffff',
        fg: '#116932',
        muted: '#bbf7d0',
        subtle: '#dcfce7',
        emphasized: '#86efac',
        focusRing: '#16a34a',
      },
      dark: {
        solid: '#22c55e',
        contrast: '#111111',
        fg: '#86efac',
        muted: '#124a28',
        subtle: '#042713',
        emphasized: '#116932',
        focusRing: '#22c55e',
      },
    },
  },
  {
    id: 'rose',
    label: 'Rose',
    cssVariables: {
      light: {
        solid: '#e11d48',
        contrast: '#ffffff',
        fg: '#9f1239',
        muted: '#fecdd3',
        subtle: '#ffe4e6',
        emphasized: '#fda4af',
        focusRing: '#e11d48',
      },
      dark: {
        solid: '#f43f5e',
        contrast: '#ffffff',
        fg: '#fda4af',
        muted: '#881337',
        subtle: '#4c0519',
        emphasized: '#9f1239',
        focusRing: '#f43f5e',
      },
    },
  },
  {
    id: 'teal',
    label: 'Teal',
    cssVariables: {
      light: {
        solid: '#0d9488',
        contrast: '#ffffff',
        fg: '#0c5d56',
        muted: '#99f6e4',
        subtle: '#ccfbf1',
        emphasized: '#5eead4',
        focusRing: '#0d9488',
      },
      dark: {
        solid: '#14b8a6',
        contrast: '#111111',
        fg: '#5eead4',
        muted: '#114240',
        subtle: '#032726',
        emphasized: '#0c5d56',
        focusRing: '#14b8a6',
      },
    },
  },
  {
    id: 'purple',
    label: 'Purple',
    cssVariables: {
      light: {
        solid: '#9333ea',
        contrast: '#ffffff',
        fg: '#6b21a8',
        muted: '#e9d5ff',
        subtle: '#f3e8ff',
        emphasized: '#d8b4fe',
        focusRing: '#9333ea',
      },
      dark: {
        solid: '#a855f7',
        contrast: '#ffffff',
        fg: '#d8b4fe',
        muted: '#581c87',
        subtle: '#3b0764',
        emphasized: '#6b21a8',
        focusRing: '#a855f7',
      },
    },
  },
] as const satisfies ThemePreset[];

export const isThemePresetId = (value: string): value is ThemePresetId => {
  return THEME_PRESETS.some((preset) => preset.id === value);
};

export const getThemePreset = (presetId: ThemePresetId): ThemePreset => {
  return THEME_PRESETS.find((preset) => preset.id === presetId) ?? THEME_PRESETS[0];
};

export const applyThemePresetVariables = (presetId: ThemePresetId, mode: ThemePresetMode) => {
  const preset = getThemePreset(presetId);
  const variables = preset.cssVariables[mode];
  const root = document.documentElement;

  root.dataset.themePreset = preset.id;

  for (const key of Object.keys(THEME_PRESET_VARIABLE_NAMES) as Array<keyof ThemePresetVariables>) {
    root.style.setProperty(THEME_PRESET_VARIABLE_NAMES[key], variables[key]);
  }
};
