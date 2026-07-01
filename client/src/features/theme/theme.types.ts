export type ThemePresetId = 'kadha-orange' | 'ocean-blue' | 'forest-green' | 'rose' | 'teal' | 'purple';

export type ThemePresetMode = 'light' | 'dark';

export interface ThemePresetVariables {
  solid: string;
  contrast: string;
  fg: string;
  muted: string;
  subtle: string;
  emphasized: string;
  focusRing: string;
}

export interface ThemePreset {
  id: ThemePresetId;
  label: string;
  cssVariables: Record<ThemePresetMode, ThemePresetVariables>;
}
