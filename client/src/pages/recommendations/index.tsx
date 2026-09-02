import { Box, Button, Center, Spinner, Stack, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { Link } from 'react-router';
import { LuSparkles } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import useRecommendations from '@/features/recommendations/api/use-recommendations';
import RecommendationListItem from '@/features/recommendations/components/recommendation-list-item';

const Recommendations = () => {
  const [page, setPage] = useState(1);
  const { data: recommendations, isLoading, isFetching, error, refetch } = useRecommendations(page);
  const response = recommendations?.data;

  return (
    <Box>
      <PageHeader isFetching={isFetching} subHeader="Private suggestions based only on the tracking signals you allow.">
        Recommendations
      </PageHeader>

      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="brand.solid" />
            <Text color="fg.muted">Finding private recommendations...</Text>
          </VStack>
        </Center>
      ) : error ? (
        <Box py={10}>
          <ErrorState
            title="Recommendations unavailable"
            description="Failed to load recommendations."
            onRetry={refetch}
          />
        </Box>
      ) : response?.status === 'NO_SIGNALS' ? (
        <Box py={10}>
          <EmptyState
            title="Not enough recommendation signals yet"
            description="Like, rate, watch, or rewatch titles to teach Kadha what you enjoy. You can choose which signals count in recommendation settings."
            icon={<LuSparkles />}
          />
          <Center mt="5">
            <Button asChild colorPalette="brand" variant="outline">
              <Link to="/app/settings/recommendations">Open recommendation settings</Link>
            </Button>
          </Center>
        </Box>
      ) : response?.items.length === 0 ? (
        <Box py={10}>
          <EmptyState
            title="No recommendations found"
            description="Kadha could not find unwatched matches from your current private signals. Try adjusting settings or adding more ratings and likes."
            icon={<LuSparkles />}
          />
        </Box>
      ) : (
        <Stack gap="5">
          <Stack gap="4">
            {response?.items.map((item) => (
              <RecommendationListItem key={`${item.media.media_type}:${item.media.media_id}`} item={item} />
            ))}
          </Stack>

          <PaginationControls pagination={recommendations?.pagination} isDisabled={isFetching} onPageChange={setPage} />
        </Stack>
      )}
    </Box>
  );
};

export default Recommendations;
