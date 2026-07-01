import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    semanticTokens: {
      colors: {
        brand: {
          solid: { value: 'var(--kadha-colors-brand-solid)' },
          contrast: { value: 'var(--kadha-colors-brand-contrast)' },
          fg: { value: 'var(--kadha-colors-brand-fg)' },
          muted: { value: 'var(--kadha-colors-brand-muted)' },
          subtle: { value: 'var(--kadha-colors-brand-subtle)' },
          emphasized: { value: 'var(--kadha-colors-brand-emphasized)' },
          focusRing: { value: 'var(--kadha-colors-brand-focus-ring)' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
