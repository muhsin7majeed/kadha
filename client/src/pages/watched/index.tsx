import { Button } from '@chakra-ui/react';
import { LuBookOpen, LuCheck } from 'react-icons/lu';
import { Link } from 'react-router';
import useWatched from '@/features/user-media/api/use-watched';
import useOwnerMediaQuery from '@/features/user-media/api/use-owner-media-query';
import OwnerMediaLibrary from '@/features/user-media/components/owner-media-library';

const Watched = () => {
  const { query, updateQuery } = useOwnerMediaQuery();
  const { data: watched, isLoading, isFetching, isPlaceholderData, error, refetch } = useWatched(undefined, { ownerQuery: query });

  return (
    <OwnerMediaLibrary
      title="Watched"
      addedLabel="Recently watched"
      firstAddedLabel="First watched"
      description="Your watched library keeps one card per title. Open Diary for individual watches, rewatches, and episodes."
      headerAction={
        <Button asChild colorPalette="gray" variant="outline" size={{ base: 'sm', md: 'md' }}>
          <Link to="/app/diary">
            <LuBookOpen aria-hidden />
            Open Diary
          </Link>
        </Button>
      }
      response={watched}
      isLoading={isLoading}
      isFetching={isFetching}
      isPlaceholderData={isPlaceholderData}
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
      libraryKey="watched"
      spinnerColor="green.500"
      query={query}
      updateQuery={updateQuery}
    />
  );
};

export default Watched;
