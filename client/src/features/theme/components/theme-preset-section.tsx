import { Badge, Box, Button, Card, Heading, HStack, SimpleGrid, Stack, Text, VStack } from '@chakra-ui/react';
import { LuCheck, LuPalette } from 'react-icons/lu';

import { useColorMode } from '@/components/ui/color-mode-hooks';
import type { ThemePresetMode } from '@/features/theme/theme.types';
import { useThemePreset } from '@/features/theme/use-theme-preset';

interface ThemePresetSectionProps {
  headingAs?: 'h2' | 'h3';
}

const ThemePresetSection = ({ headingAs = 'h2' }: ThemePresetSectionProps) => {
  const { colorMode } = useColorMode();
  const { presetId, presets, setPresetId } = useThemePreset();
  const presetMode: ThemePresetMode = colorMode === 'dark' ? 'dark' : 'light';

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading as={headingAs} textStyle="subsectionTitle">
          Theme preset
        </Heading>
        <Text color="fg.muted" textStyle="supporting">
          Accent colors update immediately and are saved for this browser.
        </Text>
      </Card.Header>
      <Card.Body>
        <Stack gap="5">
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

          <HStack
            aria-label="Accent preview"
            bg="brand.subtle"
            borderColor="brand.muted"
            borderRadius="md"
            borderWidth="1px"
            gap="3"
            p="4"
          >
            <Box p="2.5" rounded="md" bg="brand.muted" color="brand.fg">
              <LuPalette aria-hidden />
            </Box>
            <Box>
              <Text fontWeight="semibold" color="brand.fg">
                Accent preview
              </Text>
              <Text color="brand.fg" textStyle="supporting">
                Buttons, badges, links, and app highlights use this palette.
              </Text>
            </Box>
          </HStack>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default ThemePresetSection;
