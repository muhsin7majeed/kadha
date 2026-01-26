import { useGetMe } from './apis/use-get-me';
import { Box, Button, Field, Fieldset, Input } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { SubmitHandler, useForm } from 'react-hook-form';
import useUpdateMe from './apis/use-update-me';

interface ProfileInputs {
  username: string;
}

const UserProfile = () => {
  const { data: me, isLoading, isFetching, error, refetch } = useGetMe();
  const { mutateAsync: updateMe, isLoading: isUpdatingMe, error: updateMeError } = useUpdateMe();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInputs>({
    defaultValues: {
      username: me?.username || '',
    },
  });

  const onSubmit: SubmitHandler<ProfileInputs> = async (data) => {
    if (isUpdatingMe) return;

    const payload = {
      username: data.username,
    };

    await updateMe(payload);
  };

  const apiFieldErrors = error?.response?.data?.fieldErrors;

  return (
    <Box>
      <PageHeader isFetching={isFetching} mb="4">
        My Profile
      </PageHeader>

      {isLoading ? (
        <CommonSpinner />
      ) : error ? (
        <ErrorState title="Error" description="Error fetching user profile" onRetry={refetch} />
      ) : (
        <Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Fieldset.Root size="lg" maxW="md">
              <Fieldset.Content>
                <Fieldset.Content>
                  <Field.Root invalid={!!errors.username || !!apiFieldErrors?.username}>
                    <Field.Label>Username</Field.Label>
                    <Input
                      type="text"
                      {...register('username', { required: 'Username is required' })}
                      placeholder="Username"
                    />
                    <Field.ErrorText>{errors.username?.message || apiFieldErrors?.username}</Field.ErrorText>
                  </Field.Root>
                </Fieldset.Content>

                <Button type="submit" variant="surface" loading={isUpdatingMe} disabled={isUpdatingMe}>
                  Update Username
                </Button>
              </Fieldset.Content>
            </Fieldset.Root>
          </form>
        </Box>
      )}
    </Box>
  );
};

export default UserProfile;
