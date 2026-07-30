import { Button, Card, Heading, HStack } from '@chakra-ui/react';
import { LuMoon, LuSun } from 'react-icons/lu';

import { useColorMode } from '@/components/ui/color-mode-hooks';

interface ColorModeSectionProps {
  headingAs?: 'h2' | 'h3';
}

const ColorModeSection = ({ headingAs = 'h2' }: ColorModeSectionProps) => {
  const { colorMode, setColorMode } = useColorMode();

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading as={headingAs} textStyle="subsectionTitle">
          Color mode
        </Heading>
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
  );
};

export default ColorModeSection;
