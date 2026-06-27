import { useGetMe } from '@/features/user/api/use-get-me';
import { Box, Button, Field, Fieldset, Input } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import useUpdateMe from '@/features/user/api/use-update-me';
import SimpleRadioGroup from '@/components/simple-radio-group';
import { DATA_PRIVACY_OPTIONS } from '@/constants/common';
import { DataPrivacy } from '@/types/common';
import { useParams } from 'react-router';
import { useAuthAtom } from '@/atoms/auth-atom';
import OtherUserData from './other-user-data';
import { capitalize } from '@/utils/capitalize';

interface ProfileInputs {
  username: string;
  profilePrivacy: DataPrivacy;
}

type URLParams = {
  username?: string;
};

const UserProfile = () => {
  const { username } = useParams<URLParams>();
  const [auth] = useAuthAtom();

  const isMyProfile = username ? username.toLocaleLowerCase() === auth.user?.username?.toLocaleLowerCase() : true;

  const { data: me, isLoading, isFetching, error, refetch } = useGetMe({ enabled: isMyProfile });
  const { mutateAsync: updateMe, isPending: isUpdatingMe, error: updateMeError } = useUpdateMe();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProfileInputs>({
    defaultValues: {
      username: me?.username || '',
      profilePrivacy: me?.profilePrivacy || DataPrivacy.Everyone,
    },
  });

  const onSubmit: SubmitHandler<ProfileInputs> = async (data) => {
    if (isUpdatingMe) return;

    const payload = {
      username: data.username,
      profilePrivacy: data.profilePrivacy,
    };

    await updateMe(payload);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiFieldErrors = (updateMeError as any)?.response?.data?.fieldErrors;

  return (
    <Box>
      <PageHeader isFetching={isFetching} mb="4">
        {isMyProfile ? 'My' : `${capitalize(username!)}'s`} Profile
      </PageHeader>

      <Box>
        {isMyProfile ? (
          isLoading ? (
            <CommonSpinner />
          ) : error ? (
            <ErrorState title="Error" description="Error fetching user profile" onRetry={refetch} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Fieldset.Root size="lg" maxW="md">
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
              </Fieldset.Root>

              <Controller
                control={control}
                name="profilePrivacy"
                render={({ field }) => {
                  return (
                    <Fieldset.Root size="lg" maxW="md" my="4">
                      <Fieldset.Content>
                        <Field.Root>
                          <Field.Label>Who can see your profile?</Field.Label>
                          <SimpleRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
                        </Field.Root>
                      </Fieldset.Content>
                    </Fieldset.Root>
                  );
                }}
              />

              <Button type="submit" variant="surface" loading={isUpdatingMe} disabled={isUpdatingMe}>
                Update Profile
              </Button>
            </form>
          )
        ) : (
          <OtherUserData username={username!} />
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;
