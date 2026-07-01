import { Badge, Box, Button, Card, Container, Heading, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LuCheck, LuMoon, LuPalette, LuSettings, LuSun } from 'react-icons/lu';
import { useLocation } from 'react-router';

import Navbar from '@/components/navbar';
import PageHeader from '@/components/page-header';
import { useColorMode } from '@/components/ui/color-mode';
import { useThemePreset } from '@/features/theme/use-theme-preset';
import type { ThemePresetMode } from '@/features/theme/theme.types';

const SettingsContent = () => {
  const { colorMode, setColorMode } = useColorMode();
  const { presetId, presets, setPresetId } = useThemePreset();
  const presetMode: ThemePresetMode = colorMode === 'dark' ? 'dark' : 'light';

  return (
    <Container maxW="4xl" py={6}>
      <VStack align="stretch" gap={6}>
        <PageHeader subHeader="Choose how Kadha looks on this device.">
          <HStack gap={2}>
            <LuSettings />
            Settings
          </HStack>
        </PageHeader>

        <Card.Root variant="outline">
          <Card.Header>
            <Heading size="md">Color Mode</Heading>
            <Text color="fg.muted" fontSize="sm">
              Light and dark mode are independent from the accent preset.
            </Text>
          </Card.Header>
          <Card.Body>
            <HStack gap={3} flexWrap="wrap">
              <Button
                variant={colorMode === 'light' ? 'solid' : 'outline'}
                colorPalette={colorMode === 'light' ? 'brand' : 'gray'}
                onClick={() => setColorMode('light')}
              >
                <LuSun />
                Light
              </Button>
              <Button
                variant={colorMode === 'dark' ? 'solid' : 'outline'}
                colorPalette={colorMode === 'dark' ? 'brand' : 'gray'}
                onClick={() => setColorMode('dark')}
              >
                <LuMoon />
                Dark
              </Button>
            </HStack>
          </Card.Body>
        </Card.Root>

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
                          <Box boxSize="3" rounded="full" bg={variables.emphasized} borderWidth="1px" borderColor="border" />
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

        <Card.Root variant="outline" borderColor="brand.muted" bg="brand.subtle">
          <Card.Body>
            <HStack gap={3}>
              <Box p={3} rounded="md" bg="brand.muted" color="brand.fg">
                <LuPalette />
              </Box>
              <Box>
                <Heading size="sm" color="brand.fg">
                  Accent Preview
                </Heading>
                <Text color="brand.fg" fontSize="sm">
                  Buttons, badges, links, and app highlights use the selected brand palette.
                </Text>
              </Box>
            </HStack>
          </Card.Body>
        </Card.Root>
      </VStack>
    </Container>
  );
};

const Settings = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  return isAppRoute ? (
    <SettingsContent />
  ) : (
    <Box minH="100vh">
      <Navbar />
      <SettingsContent />
    </Box>
  );
};

export default Settings;
