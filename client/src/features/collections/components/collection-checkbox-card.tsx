import SimpleCheckboxCard from '@/components/simple-checkbox-card';
import { AddToCollectionPayload, Collection } from '@/features/collections/collections.types';
import { UserMedia } from '@/features/user-media/user-media.types';
import useAddToCollection from '@/features/collections/api/use-add-to-collection';
import { HStack, Stack, Text } from '@chakra-ui/react';
import CollectionSharingMeta, { CollectionSharedIcon } from './collection-sharing-meta';

interface CollectionCheckboxCardProps {
  media: UserMedia;
  collection: Collection;
}

const CollectionCheckboxCard: React.FC<CollectionCheckboxCardProps> = ({ media, collection }) => {
  const { mutateAsync: addToCollection, isPending: isAddingToCollection } = useAddToCollection();

  const handleCollectionSelection = () => {
    const payload: AddToCollectionPayload = {
      ...media,
      collectionId: collection.id,
    };

    addToCollection(payload);
  };

  return (
    <>
      <SimpleCheckboxCard
        label={
          <HStack gap="2">
            <CollectionSharedIcon collection={collection} />
            <Text as="span">{collection.name}</Text>
          </HStack>
        }
        description={
          <Stack gap="1">
            {collection.description && <Text as="span">{collection.description}</Text>}
            <CollectionSharingMeta collection={collection} />
          </Stack>
        }
        isLoading={isAddingToCollection}
        onCheckedChange={handleCollectionSelection}
        checked={collection.hasMedia}
        variant={collection.hasMedia ? 'surface' : 'outline'}
        colorPalette="brand"
      />
    </>
  );
};

export default CollectionCheckboxCard;
