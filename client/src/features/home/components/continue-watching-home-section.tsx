import { Box, Button, Flex, Spinner, Stack } from '@chakra-ui/react';
import { Link } from 'react-router';

import PageHeader from '@/components/page-header';
import useInProgressTv from '@/features/user-media/api/use-in-progress-tv';
import InProgressTvCard from '@/features/user-media/components/in-progress-tv-card';
import HomeSectionError from './home-section-error';

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
        isFetching={query.isFetching}
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
        <Flex minH="72" align="center" justify="center">
          <Spinner color="brand.solid" />
        </Flex>
      ) : (
        <Box overflowX="auto">
          <Flex gap="4" minW="max-content" align="stretch">
            {query.data?.data.map((item) => (
              <InProgressTvCard key={`${item.media_type}:${item.media_id}`} item={item} />
            ))}
          </Flex>
        </Box>
      )}
    </Stack>
  );
};

export default ContinueWatchingHomeSection;
