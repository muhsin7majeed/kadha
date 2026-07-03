import { Box, Card, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { LuDollarSign, LuTrendingUp, LuFilm } from 'react-icons/lu';
import type { MovieDetailsWithMeta } from '@/features/media/media.types';
import InfoCard from './info-card';

interface MovieInfoProps {
  data: MovieDetailsWithMeta;
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
  const hasBudget = data.budget > 0;
  const hasRevenue = data.revenue > 0;
  const hasFinancialData = hasBudget || hasRevenue;

  return (
    <VStack gap={6} align="stretch">
      {/* Financial Info */}
      <Box>
        <Heading size="lg" mb={4}>
          Box Office
        </Heading>
        {hasFinancialData ? (
          <VStack align="stretch" gap={3}>
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap={4}>
              {hasBudget && <InfoCard label="Budget" value={formatCurrency(data.budget)} icon={<LuDollarSign />} />}
              {hasRevenue && <InfoCard label="Revenue" value={formatCurrency(data.revenue)} icon={<LuTrendingUp />} />}
              {profit !== null && hasBudget && hasRevenue && (
                <InfoCard
                  label="Estimated margin"
                  value={
                    <Box as="span" color={profit >= 0 ? 'green.400' : 'red.400'}>
                      {formatCurrency(profit)}
                      {profitPercentage && (
                        <Box as="span" fontSize="sm" color="fg.muted" ml={1}>
                          ({profit >= 0 ? '+' : ''}
                          {profitPercentage}%)
                        </Box>
                      )}
                    </Box>
                  }
                />
              )}
            </SimpleGrid>
            {profit !== null && hasBudget && hasRevenue && (
              <Text color="fg.muted" fontSize="sm">
                Budget and revenue are public TMDB figures and may not include marketing or distribution costs.
              </Text>
            )}
          </VStack>
        ) : (
          <Text color="fg.muted">No box-office figures are listed for this movie.</Text>
        )}
      </Box>

      {/* Collection */}
      {data.belongs_to_collection && (
        <Box>
          <Heading size="lg" mb={4}>
            Part of Collection
          </Heading>
          <Card.Root variant="outline" overflow="hidden">
            <HStack gap={0} align="stretch">
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
                    <Box p={2} bg="brand.subtle" borderRadius="md">
                      <LuFilm color="var(--chakra-colors-brand-fg)" />
                    </Box>
                    <Heading size="md">{data.belongs_to_collection.name}</Heading>
                  </HStack>
                  <Text color="fg.muted" fontSize="sm">
                    This title belongs to the {data.belongs_to_collection.name}. Collection browsing is not available
                    from this page yet.
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
