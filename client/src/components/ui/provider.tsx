'use client';

import { ChakraProvider } from '@chakra-ui/react';
import { ThemePresetProvider } from '@/features/theme/theme-provider';
import { system } from '@/theme/system';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider({ children, ...props }: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props}>
        <ThemePresetProvider>{children}</ThemePresetProvider>
      </ColorModeProvider>
    </ChakraProvider>
  );
}
