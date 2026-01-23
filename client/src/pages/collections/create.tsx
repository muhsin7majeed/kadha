import PageHeader from '@/components/page-header';
import SimpleRadioGroup from '@/components/simple-radio-group';
import { Button, CloseButton, Field, Fieldset, Flex, Input, Textarea } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import useCreateCollection from './apis/use-create-collection';
import { DataPrivacy } from '@/types/common';
import { DATA_PRIVACY_OPTIONS } from '@/constants/common';

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

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CollectionFormFields>({
    defaultValues: {
      name: '',
      description: '',
      privacy: DataPrivacy.Everyone,
    },
  });

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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex justify="space-between" align="center" mb={4}>
          <PageHeader>Create Collection</PageHeader>

          <Flex gap={2} align="center">
            <Button
              type="submit"
              size="sm"
              variant="subtle"
              colorPalette="orange"
              loading={isPending}
              disabled={isPending}
            >
              Save
            </Button>

            <CloseButton onClick={onClose} />
          </Flex>
        </Flex>

        <Fieldset.Root size="lg" maxW="md">
          <Fieldset.Content>
            <Fieldset.Content>
              <Field.Root invalid={!!errors.name}>
                <Input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Collection Name"
                  autoFocus
                />
                <Field.ErrorText>{errors.name?.message}</Field.ErrorText>
              </Field.Root>

              <Field.Root invalid={!!errors.description}>
                <Textarea
                  rows={4}
                  {...register('description', {
                    required: 'Description is required',
                  })}
                  placeholder="What is this collection about?"
                />
                <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
              </Field.Root>

              <Controller
                control={control}
                name="privacy"
                render={({ field }) => (
                  <SimpleRadioGroup {...field} label="Who can see this collection?" options={DATA_PRIVACY_OPTIONS} />
                )}
              />
            </Fieldset.Content>
          </Fieldset.Content>
        </Fieldset.Root>
      </form>
    </>
  );
};

export default CreateCollection;
