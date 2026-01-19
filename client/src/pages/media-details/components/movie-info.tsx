import { Box, Card, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LuDollarSign, LuTrendingUp, LuFilm } from 'react-icons/lu';
import type { MovieDetails } from '@/types/media';
import InfoCard from './info-card';

interface MovieInfoProps {
  data: MovieDetails;
}

const formatCurrency = (value: number) => {
  if (!value || value === 0) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
};

const MovieInfo = ({ data }: MovieInfoProps) => {
  const profit = data.revenue && data.budget ? data.revenue - data.budget : null;
  const profitPercentage = profit && data.budget ? ((profit / data.budget) * 100).toFixed(1) : null;

  return (
    <VStack gap={6} align="stretch">
      {/* Financial Info */}
      <Box>
        <Heading size="lg" mb={4}>
          Box Office
        </Heading>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
          <InfoCard label="Budget" value={formatCurrency(data.budget)} icon={<LuDollarSign />} />
          <InfoCard label="Revenue" value={formatCurrency(data.revenue)} icon={<LuTrendingUp />} />
          {profit !== null && data.budget > 0 && data.revenue > 0 && (
            <InfoCard
              label="Profit"
              value={
                <Text color={profit >= 0 ? 'green.400' : 'red.400'}>
                  {formatCurrency(profit)}
                  {profitPercentage && (
                    <Text as="span" fontSize="sm" color="fg.muted" ml={1}>
                      ({profit >= 0 ? '+' : ''}
                      {profitPercentage}%)
                    </Text>
                  )}
                </Text>
              }
            />
          )}
        </SimpleGrid>
      </Box>

      {/* Collection */}
      {data.belongs_to_collection && (
        <Box>
          <Heading size="lg" mb={4}>
            Part of Collection
          </Heading>
          <Card.Root variant="outline" overflow="hidden">
            <HStack gap={0}>
              {data.belongs_to_collection.poster_path && (
                <Image
                  src={`https://image.tmdb.org/t/p/w200${data.belongs_to_collection.poster_path}`}
                  alt={data.belongs_to_collection.name}
                  width="120px"
                  height="180px"
                  objectFit="cover"
                />
              )}
              <Card.Body>
                <VStack align="start" gap={2}>
                  <HStack>
                    <Box p={2} bg="darkorange/10" borderRadius="md">
                      <LuFilm color="var(--chakra-colors-orange-400)" />
                    </Box>
                    <Heading size="md">{data.belongs_to_collection.name}</Heading>
                  </HStack>
                  <Text color="fg.muted" fontSize="sm">
                    This movie is part of the {data.belongs_to_collection.name}
                  </Text>
                </VStack>
              </Card.Body>
            </HStack>
          </Card.Root>
        </Box>
      )}
    </VStack>
  );
};

export default MovieInfo;
