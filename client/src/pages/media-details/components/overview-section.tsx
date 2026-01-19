import { Box, Heading, Text, VStack } from '@chakra-ui/react';

interface OverviewSectionProps {
  overview: string;
}

const OverviewSection = ({ overview }: OverviewSectionProps) => {
  if (!overview) return null;

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Overview
      </Heading>
      <VStack align="start" gap={4}>
        <Text fontSize="lg" color="fg.muted" lineHeight="tall">
          {overview}
        </Text>
      </VStack>
    </Box>
  );
};

export default OverviewSection;
