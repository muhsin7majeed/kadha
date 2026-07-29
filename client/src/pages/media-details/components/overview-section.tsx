import { Box, Heading, Text, VStack } from '@chakra-ui/react';

interface OverviewSectionProps {
  overview: string;
}

const OverviewSection = ({ overview }: OverviewSectionProps) => {
  if (!overview) return null;

  return (
    <Box>
      <Heading textStyle="sectionTitle" mb={4}>
        Overview
      </Heading>
      <VStack align="start" gap={4}>
        <Text textStyle="lead" color="fg.muted">
          {overview}
        </Text>
      </VStack>
    </Box>
  );
};

export default OverviewSection;
