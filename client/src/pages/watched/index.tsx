import { Button } from '@chakra-ui/react';
import { LuBookOpen, LuCheck } from 'react-icons/lu';
import { Link } from 'react-router';
import useWatched from '@/features/user-media/api/use-watched';
import MediaListPage from '@/components/media-list-page';
import { useState } from 'react';

const Watched = () => {
  const [page, setPage] = useState(1);
  const { data: watched, isLoading, isFetching, error, refetch } = useWatched(undefined, { page });

  return (
    <MediaListPage
      title="Watched"
      description="Your watched library keeps one card per title. Open Diary for individual watches, rewatches, and episodes."
      headerAction={
        <Button asChild colorPalette="gray" variant="outline" size={{ base: 'sm', md: 'md' }}>
          <Link to="/app/diary">
            <LuBookOpen aria-hidden />
            Open Diary
          </Link>
        </Button>
      }
      data={watched?.data}
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      refetch={refetch}
      emptyState={{
        title: 'Nothing watched yet',
        description:
          "Mark movies and shows as watched to track your viewing history. Never wonder 'have I seen this?' again!",
        icon: <LuCheck />,
      }}
      errorDescription="Failed to fetch watched"
      loadingText="Loading your watch history..."
      spinnerColor="green.500"
      pagination={watched?.pagination}
      onPageChange={setPage}
    />
  );
};

export default Watched;
