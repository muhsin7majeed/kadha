import PageHeader from '@/components/page-header';
import { Button, CloseButton, Field, Fieldset, Input, Textarea, useDialogContext } from '@chakra-ui/react';
import { CollectionFormFields } from '@/types/collections';
import { Flex } from '@chakra-ui/react';
import { Controller, useForm } from 'react-hook-form';
import SimpleRadioGroup from '@/components/simple-radio-group';
import { DATA_PRIVACY_OPTIONS } from '@/constants/common';

interface CollectionFormProps {
  initialValues: CollectionFormFields;
  onSubmit: (values: CollectionFormFields) => void;
  isLoading: boolean;
  title: string;
  onClose: () => void;
}

const CollectionForm: React.FC<CollectionFormProps> = ({ initialValues, isLoading, onSubmit, title }) => {
  const { setOpen: setDialogOpen } = useDialogContext();

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<CollectionFormFields>({
    defaultValues: initialValues,
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex justify="space-between" align="center" mb={4}>
          <PageHeader>{title}</PageHeader>

          <Flex gap={2} align="center">
            <Button
              type="submit"
              size="sm"
              variant="subtle"
              colorPalette="orange"
              loading={isLoading}
              disabled={isLoading}
            >
              Save
            </Button>

            <CloseButton
              size="sm"
              onClick={() => {
                setDialogOpen(false);
              }}
            />
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

export default CollectionForm;
