import { Button, Field, Fieldset, Input, Stack } from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect } from 'react';

import SimpleRadioGroup from '@/components/simple-radio-group';
import { DATA_PRIVACY_OPTIONS, PROFILE_PRIVACY_OPTIONS } from '@/constants/common';
import { User } from '@/features/user/user.types';
import useUpdateMe from '@/features/user/api/use-update-me';
import { DataPrivacy } from '@/types/common';

interface ProfileInputs {
  username: string;
  profilePrivacy: DataPrivacy;
  watchedPrivacy: DataPrivacy;
  likedPrivacy: DataPrivacy;
  watchlistPrivacy: DataPrivacy;
}

interface MyProfileSettingsProps {
  me: User;
}

const MyProfileSettings: React.FC<MyProfileSettingsProps> = ({ me }) => {
  const { mutateAsync: updateMe, isPending: isUpdatingMe, error: updateMeError } = useUpdateMe();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProfileInputs>({
    defaultValues: {
      username: me.username,
      profilePrivacy: me.profilePrivacy,
      watchedPrivacy: me.watchedPrivacy,
      likedPrivacy: me.likedPrivacy,
      watchlistPrivacy: me.watchlistPrivacy,
    },
  });

  useEffect(() => {
    reset({
      username: me.username,
      profilePrivacy: me.profilePrivacy,
      watchedPrivacy: me.watchedPrivacy,
      likedPrivacy: me.likedPrivacy,
      watchlistPrivacy: me.watchlistPrivacy,
    });
  }, [me, reset]);

  const onSubmit: SubmitHandler<ProfileInputs> = async (data) => {
    if (isUpdatingMe) return;

    await updateMe(data);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiFieldErrors = (updateMeError as any)?.response?.data?.fieldErrors;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="5" maxW="2xl">
        <Fieldset.Root size="lg">
          <Fieldset.Content>
            <Field.Root invalid={!!errors.username || !!apiFieldErrors?.username}>
              <Field.Label>Username</Field.Label>
              <Input type="text" {...register('username', { required: 'Username is required' })} />
              <Field.ErrorText>{errors.username?.message || apiFieldErrors?.username}</Field.ErrorText>
            </Field.Root>
          </Fieldset.Content>
        </Fieldset.Root>

        <Controller
          control={control}
          name="profilePrivacy"
          render={({ field }) => (
            <Field.Root>
              <Field.Label>Who can see your profile?</Field.Label>
              <SimpleRadioGroup options={PROFILE_PRIVACY_OPTIONS} {...field} />
            </Field.Root>
          )}
        />

        <Controller
          control={control}
          name="watchedPrivacy"
          render={({ field }) => (
            <Field.Root>
              <Field.Label>Who can see your watched list?</Field.Label>
              <SimpleRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
            </Field.Root>
          )}
        />

        <Controller
          control={control}
          name="likedPrivacy"
          render={({ field }) => (
            <Field.Root>
              <Field.Label>Who can see your liked list?</Field.Label>
              <SimpleRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
            </Field.Root>
          )}
        />

        <Controller
          control={control}
          name="watchlistPrivacy"
          render={({ field }) => (
            <Field.Root>
              <Field.Label>Who can see your watchlist?</Field.Label>
              <SimpleRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
            </Field.Root>
          )}
        />

        <Button type="submit" variant="surface" loading={isUpdatingMe} disabled={isUpdatingMe} alignSelf="start">
          Update Profile
        </Button>
      </Stack>
    </form>
  );
};

export default MyProfileSettings;
