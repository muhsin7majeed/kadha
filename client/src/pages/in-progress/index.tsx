import {
  Box,
  Field,
  HStack,
  NativeSelect,
  SimpleGrid,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import { LuListChecks } from "react-icons/lu";

import EmptyState from "@/components/info-states/empty-state";
import ErrorState from "@/components/info-states/error-state";
import PageHeader from "@/components/page-header";
import PaginationControls from "@/components/pagination-controls";
import useInProgressTv from "@/features/user-media/api/use-in-progress-tv";
import InProgressTvCard from "@/features/user-media/components/in-progress-tv-card";
import type { InProgressTvSort } from "@/features/user-media/user-media.types";
import MediaListSkeleton from "@/components/loading/media-list-skeleton";

const InProgress = () => {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<InProgressTvSort>("recent");
  const resultsRef = useRef<HTMLDivElement>(null);
  const {
    data: inProgressTv,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useInProgressTv({ page, sort });

  return (
    <Box>
      <PageHeader
        isRefreshing={isFetching && !isLoading && inProgressTv !== undefined}
        subHeader="TV shows with episode progress, including the next aired episode when one is available."
      >
        In Progress
      </PageHeader>

      <HStack justify="flex-end" mb="5">
        <Field.Root width={{ base: "full", sm: "64" }}>
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
        <MediaListSkeleton label="Loading your TV progress" />
      ) : error ? (
        <Box py={10}>
          <ErrorState
            title="Error"
            description="Failed to fetch in-progress shows"
            onRetry={refetch}
          />
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
          <SimpleGrid
            ref={resultsRef}
            columns={{ base: 1, sm: 2, md: 3, lg: 4 }}
            gap={6}
            justifyItems={{ base: "stretch", sm: "center" }}
          >
            {inProgressTv?.data.map((item) => (
              <InProgressTvCard
                key={`${item.media_type}:${item.media_id}`}
                item={item}
                variant="page"
              />
            ))}
          </SimpleGrid>
          <PaginationControls
            pagination={inProgressTv?.pagination}
            isDisabled={isFetching}
            onPageChange={setPage}
            scrollTargetRef={resultsRef}
          />
        </>
      )}
    </Box>
  );
};

export default InProgress;
