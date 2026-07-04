import { Badge, Box, Button, Card, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LuCheck } from 'react-icons/lu';

import { useColorMode } from '@/components/ui/color-mode';
import type { ThemePresetMode } from '@/features/theme/theme.types';
import { useThemePreset } from '@/features/theme/use-theme-preset';

const ThemePresetSection = () => {
  const { colorMode } = useColorMode();
  const { presetId, presets, setPresetId } = useThemePreset();
  const presetMode: ThemePresetMode = colorMode === 'dark' ? 'dark' : 'light';

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading size="md">Theme Preset</Heading>
        <Text color="fg.muted" fontSize="sm">
          Accent colors update immediately and are saved for this browser.
        </Text>
      </Card.Header>
      <Card.Body>
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={4}>
          {presets.map((preset) => {
            const isSelected = preset.id === presetId;
            const variables = preset.cssVariables[presetMode];

            return (
              <Button
                key={preset.id}
                variant="outline"
                justifyContent="flex-start"
                h="auto"
                p={4}
                borderColor={isSelected ? 'brand.solid' : 'border'}
                bg={isSelected ? 'brand.subtle' : 'transparent'}
                color={isSelected ? 'brand.fg' : 'fg'}
                onClick={() => setPresetId(preset.id)}
              >
                <HStack gap={3} w="full">
                  <Box
                    boxSize="8"
                    rounded="full"
                    borderWidth="1px"
                    borderColor="border.emphasized"
                    bg={variables.solid}
                    flexShrink={0}
                  />
                  <VStack gap={0} align="start" flex={1} minW={0}>
                    <Text fontWeight="semibold" truncate>
                      {preset.label}
                    </Text>
                    <HStack gap={1}>
                      <Box boxSize="3" rounded="full" bg={variables.subtle} borderWidth="1px" borderColor="border" />
                      <Box boxSize="3" rounded="full" bg={variables.muted} borderWidth="1px" borderColor="border" />
                      <Box
                        boxSize="3"
                        rounded="full"
                        bg={variables.emphasized}
                        borderWidth="1px"
                        borderColor="border"
                      />
                    </HStack>
                  </VStack>
                  {isSelected && (
                    <Badge colorPalette="brand" variant="solid" flexShrink={0}>
                      <LuCheck />
                      Active
                    </Badge>
                  )}
                </HStack>
              </Button>
            );
          })}
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
};

export default ThemePresetSection;
