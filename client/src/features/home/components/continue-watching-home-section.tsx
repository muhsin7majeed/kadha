import { Box, Button, Flex, Stack } from '@chakra-ui/react';
import { Link } from 'react-router';

import PageHeader from '@/components/page-header';
import useInProgressTv from '@/features/user-media/api/use-in-progress-tv';
import InProgressTvCard from '@/features/user-media/components/in-progress-tv-card';
import HomeSectionError from './home-section-error';
import MediaCarouselSkeleton from '@/components/media-carousel/media-carousel-skeleton';

const ContinueWatchingHomeSection = () => {
  const query = useInProgressTv({ enabled: true, limit: 10, page: 1, sort: 'recent' });

  if (query.error) {
    return (
      <HomeSectionError
        title="Continue Watching"
        description="Your TV progress could not be loaded."
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.isLoading && query.data?.data.length === 0) return null;

  return (
    <Stack gap="3">
      <PageHeader
        isRefreshing={query.isFetching && !query.isLoading && query.data !== undefined}
        mb="0"
        action={
          <Button asChild size="sm" variant="ghost" colorPalette="brand">
            <Link to="/app/in-progress">View all</Link>
          </Button>
        }
      >
        Continue Watching
      </PageHeader>

      {query.isLoading ? (
        <MediaCarouselSkeleton label="Loading Continue Watching" />
      ) : (
        <Box overflowX="auto">
          <Flex gap="4" minW="max-content" align="stretch">
            {query.data?.data.map((item) => (
              <InProgressTvCard
                key={`${item.media_type}:${item.media_id}`}
                item={item}
                showDetailsAction={false}
              />
            ))}
          </Flex>
        </Box>
      )}
    </Stack>
  );
};

export default ContinueWatchingHomeSection;
