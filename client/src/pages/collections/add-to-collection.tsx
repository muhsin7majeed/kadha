import PageHeader from '@/components/page-header';
import { UserMedia } from '@/types/user-media';
import { Box, CloseButton, Flex, Group, IconButton, VStack } from '@chakra-ui/react';
import useCollections from './apis/use-collections';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import { LuPlus } from 'react-icons/lu';
import CollectionCheckboxCard from './collection-checkbox-card';
import CreateCollectionButton from './create-collection-button';

interface AddToCollectionProps {
  media: UserMedia;
  onClose: () => void;
}

const AddToCollection: React.FC<AddToCollectionProps> = ({ media, onClose }) => {
  const {
    data: collections,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCollections({
    mediaId: media.media_id,
    mediaType: media.media_type,
  });

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <PageHeader isFetching={isFetching}>Add to Collection</PageHeader>

        <Group>
          <CreateCollectionButton
            buttonElement={
              <IconButton
                variant="subtle"
                borderRadius="full"
                colorPalette="orange"
                aria-label="Create Collection"
                title="Create Collection"
                size="sm"
              >
                <LuPlus />
              </IconButton>
            }
          />

          <CloseButton
            aria-label="Close"
            title="Close"
            borderRadius="full"
            onClick={() => {
              onClose();
            }}
          />
        </Group>
      </Flex>

      {isLoading ? (
        <CommonSpinner />
      ) : error ? (
        <ErrorState title="Error" description="Error loading collections" onRetry={refetch} />
      ) : !collections || collections?.length === 0 ? (
        <EmptyState title="No collections" description="Create a new collection to add your media to" />
      ) : (
        <VStack gap="4" alignItems="stretch">
          {collections.map((collection) => (
            <CollectionCheckboxCard key={collection.id} media={media} collection={collection} />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default AddToCollection;
