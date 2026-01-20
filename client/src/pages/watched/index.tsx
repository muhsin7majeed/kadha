import { LuCheck } from 'react-icons/lu';
import useWatched from './apis/use-watched';
import MediaListPage from '@/components/media-list-page';
import { Container } from '@chakra-ui/react';

const Watched = () => {
  const { data: watched, isLoading, isFetching, error, refetch } = useWatched();

  return (
    <Container maxW="6xl" py={{ base: 8, md: 12 }}>
      <MediaListPage
        title="Watched"
        description="Your viewing history. All the movies and shows you've completed watching, all in one place."
        data={watched}
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
      />
    </Container>
  );
};

export default Watched;
