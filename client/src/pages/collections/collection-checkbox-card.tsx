import SimpleCheckboxCard from '@/components/simple-checkbox-card';
import { AddToCollectionPayload, Collection } from '@/types/collections';
import { UserMedia } from '@/types/user-media';
import useAddToCollection from './apis/use-add-to-collection';

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
        label={collection.name}
        description={collection.description ?? '--'}
        isLoading={isAddingToCollection}
        onCheckedChange={handleCollectionSelection}
        checked={collection.hasMedia}
        variant={collection.hasMedia ? 'surface' : 'outline'}
        colorPalette={'orange'}
      />
    </>
  );
};

export default CollectionCheckboxCard;
