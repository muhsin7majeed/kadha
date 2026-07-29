import { Box, Card, Heading, HStack, Text } from '@chakra-ui/react';
import { LuPalette } from 'react-icons/lu';

const AccentPreviewCard = () => (
  <Card.Root variant="outline" borderColor="brand.muted" bg="brand.subtle">
    <Card.Body>
      <HStack gap={3}>
        <Box p={3} rounded="md" bg="brand.muted" color="brand.fg">
          <LuPalette />
        </Box>
        <Box>
          <Heading textStyle="subsectionTitle" color="brand.fg">
            Accent Preview
          </Heading>
          <Text color="brand.fg" textStyle="supporting">
            Buttons, badges, links, and app highlights use the selected brand palette.
          </Text>
        </Box>
      </HStack>
    </Card.Body>
  </Card.Root>
);

export default AccentPreviewCard;
