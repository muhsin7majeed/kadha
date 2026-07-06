import { afterEach, describe, expect, it } from 'vitest';

import {
  applyThemePresetVariables,
  DEFAULT_THEME_PRESET_ID,
  getThemePreset,
  isThemePresetId,
  THEME_PRESET_VARIABLE_NAMES,
} from './theme-presets';

describe('theme presets', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-theme-preset');
    document.documentElement.removeAttribute('style');
  });

  it('validates and resolves theme preset ids', () => {
    expect(isThemePresetId(DEFAULT_THEME_PRESET_ID)).toBe(true);
    expect(isThemePresetId('missing')).toBe(false);
    expect(getThemePreset('ocean-blue').label).toBe('Ocean Blue');
  });

  it('applies preset CSS variables to the document root', () => {
    applyThemePresetVariables('ocean-blue', 'dark');

    expect(document.documentElement.dataset.themePreset).toBe('ocean-blue');
    expect(document.documentElement.style.getPropertyValue(THEME_PRESET_VARIABLE_NAMES.solid)).toBe('#3b82f6');
    expect(document.documentElement.style.getPropertyValue(THEME_PRESET_VARIABLE_NAMES.contrast)).toBe('#ffffff');
  });
});
