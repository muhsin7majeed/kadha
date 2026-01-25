import CollectionForm from './collection-form';
import { Collection, CollectionFormFields } from '@/types/collections';
import useUpdateCollection from '../apis/use-update-collection';

interface UpdateCollectionProps {
  collection: Collection;
  onClose: () => void;
}

const UpdateCollection: React.FC<UpdateCollectionProps> = ({ collection, onClose }) => {
  const { mutateAsync: updateCollection, isPending } = useUpdateCollection();

  const onSubmit = async (values: CollectionFormFields) => {
    const payload = {
      id: collection.id,
      name: values.name,
      description: values.description,
      privacy: values.privacy,
    };

    await updateCollection(payload);

    onClose();
  };

  const initialValues: CollectionFormFields = {
    name: collection.name,
    description: collection.description,
    privacy: collection.privacy,
  };

  return (
    <>
      <CollectionForm
        title="Update Collection"
        initialValues={initialValues}
        onSubmit={onSubmit}
        isLoading={isPending}
        onClose={onClose}
      />
    </>
  );
};

export default UpdateCollection;
