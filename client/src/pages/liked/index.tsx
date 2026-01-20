import { LuHeart } from 'react-icons/lu';
import useLiked from './apis/use-liked';
import MediaListPage from '@/components/media-list-page';
import { Container } from '@chakra-ui/react';

const Liked = () => {
  const { data: liked, isLoading, isFetching, error, refetch } = useLiked();

  return (
    <Container maxW="6xl" py={{ base: 8, md: 12 }}>
      <MediaListPage
        title="Liked"
        description="Your favorite movies and shows. The ones that left a lasting impression and deserve a special place."
        data={liked}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        refetch={refetch}
        emptyState={{
          title: 'No favorites yet',
          description: 'Like movies and shows to add them here. Build your collection of all-time favorites!',
          icon: <LuHeart />,
        }}
        errorDescription="Failed to fetch liked"
        loadingText="Loading your favorites..."
        spinnerColor="red.500"
      />
    </Container>
  );
};

export default Liked;
