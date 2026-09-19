import { LuHeart } from 'react-icons/lu';
import useLiked from '@/features/user-media/api/use-liked';
import useOwnerMediaQuery from '@/features/user-media/api/use-owner-media-query';
import OwnerMediaLibrary from '@/features/user-media/components/owner-media-library';

const Liked = () => {
  const { query, updateQuery } = useOwnerMediaQuery();
  const { data: liked, isLoading, isFetching, isPlaceholderData, error, refetch } = useLiked(undefined, { ownerQuery: query });

  return (
    <OwnerMediaLibrary
      title="Liked"
      addedLabel="Recently liked"
      firstAddedLabel="First liked"
      description="Your favorite movies and shows. The ones that left a lasting impression and deserve a special place."
      response={liked}
      isLoading={isLoading}
      isFetching={isFetching}
      isPlaceholderData={isPlaceholderData}
      error={error}
      refetch={refetch}
      emptyState={{
        title: 'No favorites yet',
        description: 'Like movies and shows to add them here. Build your collection of all-time favorites!',
        icon: <LuHeart />,
      }}
      errorDescription="Failed to fetch liked"
      loadingText="Loading your favorites..."
      libraryKey="liked"
      spinnerColor="red.500"
      query={query}
      updateQuery={updateQuery}
    />
  );
};

export default Liked;
