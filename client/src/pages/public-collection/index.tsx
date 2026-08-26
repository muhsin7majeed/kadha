import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import MediaCard from '@/components/media-card';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import usePublicCollection from '@/features/collections/api/use-public-collection';
import { collectionMediaToMediaCardModel } from '@/features/collections/utils/collection-media';
import { Badge, Box, HStack, Separator, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useParams } from 'react-router';

const getLockedCopy = (reason?: string) => {
  if (reason === 'SIGN_IN_REQUIRED') {
    return {
      title: 'Sign in required',
      description: 'The owner shares this collection with Kadha users or friends. Sign in to check your access.',
    };
  }

  if (reason === 'FRIENDS_ONLY') {
    return {
      title: 'Friends only',
      description: 'The owner only shares this collection with accepted friends.',
    };
  }

  return {
    title: 'Private collection',
    description: 'The owner is not sharing this collection publicly right now.',
  };
};

const PublicCollection = () => {
  const { id = '' } = useParams();
  const { data, isLoading, error, refetch } = usePublicCollection(id);

  if (isLoading) return <CommonSpinner />;

  if (error) {
    return <ErrorState title="Error" description="Failed to load collection" onRetry={refetch} />;
  }

  if (data?.access.canView === false) {
    const lockedCopy = getLockedCopy(data.access.lockedReason);
    return <EmptyState title={lockedCopy.title} description={lockedCopy.description} />;
  }

  const collection = data?.data;

  if (!collection) {
    return <ErrorState title="Not found" description="Collection not found" onRetry={refetch} />;
  }

  return (
    <Box>
      <PageHeader subHeader={collection.owner?.username ? `Shared by ${collection.owner.username}` : undefined} mb="5">
        {collection.name}
      </PageHeader>

      <Stack gap="2" mb="4">
        {collection.description && (
          <Text color="fg.muted" textStyle="supporting">
            {collection.description}
          </Text>
        )}

        <HStack gap="2" flexWrap="wrap">
          <Badge variant="surface">Read-only</Badge>
          <Badge variant="surface">{collection.media.length} items</Badge>
        </HStack>
      </Stack>

      <HStack my="4">
        <Separator flex="1" />
        <Text flexShrink="0" color="fg.muted" textStyle="supporting">
          In this collection
        </Text>
        <Separator flex="1" />
      </HStack>

      {collection.media.length > 0 ? (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} gap={6}>
          {collection.media.map((media) => (
            <MediaCard
              key={`${media.media_type}-${media.media_id}`}
              detailsPathPrefix="/media"
              media={collectionMediaToMediaCardModel(media)}
              showActions={false}
            />
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState title="No media" description="This collection is empty." />
      )}
    </Box>
  );
};

export default PublicCollection;
