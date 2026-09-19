import { Box, Center, Field, HStack, NativeSelect, SimpleGrid, Spinner, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuListChecks } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import useInProgressTv from '@/features/user-media/api/use-in-progress-tv';
import InProgressTvCard from '@/features/user-media/components/in-progress-tv-card';
import type { InProgressTvSort } from '@/features/user-media/user-media.types';

const InProgress = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<InProgressTvSort>('recent');
  const { data: inProgressTv, isLoading, isFetching, error, refetch } = useInProgressTv({ page, sort });

  return (
    <Box>
      <PageHeader
        isFetching={isFetching}
        subHeader="TV shows with episode progress, including the next aired episode when one is available."
      >
        In Progress
      </PageHeader>

      <HStack justify="flex-end" mb="5">
        <Field.Root width={{ base: 'full', sm: '64' }}>
          <Field.Label>Sort</Field.Label>
          <NativeSelect.Root disabled={isFetching}>
            <NativeSelect.Field
              value={sort}
              onChange={(event) => {
                setSort(event.currentTarget.value as InProgressTvSort);
                setPage(1);
              }}
            >
              <option value="recent">Recently watched</option>
              <option value="next">Next episode</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </HStack>

      {isLoading ? (
        <Center py={20}>
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="fg.muted">Loading your TV progress...</Text>
          </VStack>
        </Center>
      ) : error ? (
        <Box py={10}>
          <ErrorState title="Error" description="Failed to fetch in-progress shows" onRetry={refetch} />
        </Box>
      ) : inProgressTv?.data.length === 0 ? (
        <Box py={10}>
          <EmptyState
            title="No shows in progress"
            description="Episode progress from TV detail pages will appear here."
            icon={<LuListChecks />}
          />
        </Box>
      ) : (
        <>
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6} justifyItems="center">
            {inProgressTv?.data.map((item) => (
              <InProgressTvCard key={`${item.media_type}:${item.media_id}`} item={item} />
            ))}
          </SimpleGrid>
          <PaginationControls pagination={inProgressTv?.pagination} isDisabled={isFetching} onPageChange={setPage} />
        </>
      )}
    </Box>
  );
};

export default InProgress;
