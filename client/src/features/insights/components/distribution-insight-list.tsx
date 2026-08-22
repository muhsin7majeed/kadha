import { Box, Flex, Stack, Text } from '@chakra-ui/react';

import { InsightDistributionItem } from '../insights.types';

interface DistributionInsightListProps {
  items: InsightDistributionItem[];
  emptyText: string;
  limit?: number;
}

const DistributionInsightList = ({ items, emptyText, limit = 5 }: DistributionInsightListProps) => {
  const visibleItems = items.slice(0, limit);

  if (visibleItems.length === 0) {
    return (
      <Text color="fg.muted" textStyle="supporting">
        {emptyText}
      </Text>
    );
  }

  const maxValue = Math.max(...visibleItems.map((item) => item.value), 1);

  return (
    <Stack as="ol" listStyleType="none" gap="3" m="0" p="0">
      {visibleItems.map((item, index) => (
        <Box
          as="li"
          key={item.key}
          aria-label={`${index + 1}. ${item.label}, ${item.value} ${item.value === 1 ? 'title' : 'titles'}`}
          position="relative"
          overflow="hidden"
          borderRadius="md"
          bg="bg.subtle"
          minH="11"
        >
          <Box
            aria-hidden="true"
            position="absolute"
            insetY="0"
            insetStart="0"
            width={`${Math.max((item.value / maxValue) * 100, 4)}%`}
            bg="brand.subtle"
          />
          <Flex position="relative" align="center" justify="space-between" gap="3" minH="11" px="3" py="2">
            <Flex align="center" gap="3" minW="0">
              <Text color="fg.muted" textStyle="compactLabel" minW="4" aria-hidden="true">
                {index + 1}
              </Text>
              <Text fontWeight="medium" truncate>
                {item.label}
              </Text>
            </Flex>
            <Text flexShrink={0} textStyle="compactLabel">
              {item.value} {item.value === 1 ? 'title' : 'titles'}
            </Text>
          </Flex>
        </Box>
      ))}
    </Stack>
  );
};

export default DistributionInsightList;
