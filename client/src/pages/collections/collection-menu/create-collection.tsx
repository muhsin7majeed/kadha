import useCreateCollection from '../apis/use-create-collection';
import { DataPrivacy } from '@/types/common';
import CollectionForm from './collection-form';

export interface CollectionFormFields {
  name: string;
  description: string;
  privacy: DataPrivacy;
}

interface CreateCollectionProps {
  onClose: () => void;
}

const CreateCollection: React.FC<CreateCollectionProps> = ({ onClose }) => {
  const { mutateAsync: createCollection, isPending } = useCreateCollection();

  const onSubmit = async (values: CollectionFormFields) => {
    if (isPending) return;

    const payload = {
      name: values.name,
      description: values.description,
      privacy: values.privacy,
    };

    await createCollection(payload);

    onClose();
  };

  const initialValues: CollectionFormFields = {
    name: '',
    description: '',
    privacy: DataPrivacy.Everyone,
  };

  return (
    <>
      <CollectionForm
        title="Create Collection"
        initialValues={initialValues}
        onSubmit={onSubmit}
        isLoading={isPending}
        onClose={onClose}
      />
    </>
  );
};

export default CreateCollection;
