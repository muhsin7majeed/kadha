import { Button, Field, Fieldset, Input, NativeSelect, Stack } from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect } from 'react';

import SimpleRadioGroup from '@/components/simple-radio-group';
import { DATA_PRIVACY_OPTIONS, PROFILE_PRIVACY_OPTIONS } from '@/constants/common';
import { User } from '@/features/user/user.types';
import useUpdateMe from '@/features/user/api/use-update-me';
import { DataPrivacy } from '@/types/common';
import { getApiFieldError } from '@/hooks/use-error-handler';
import { WATCH_REGIONS } from '@/constants/watch-regions';

interface ProfileInputs {
  username: string;
  profilePrivacy: DataPrivacy;
  watchedPrivacy: DataPrivacy;
  likedPrivacy: DataPrivacy;
  watchlistPrivacy: DataPrivacy;
  watchRegion: string;
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
      watchRegion: me.watchRegion,
    },
  });

  useEffect(() => {
    reset({
      username: me.username,
      profilePrivacy: me.profilePrivacy,
      watchedPrivacy: me.watchedPrivacy,
      likedPrivacy: me.likedPrivacy,
      watchlistPrivacy: me.watchlistPrivacy,
      watchRegion: me.watchRegion,
    });
  }, [me, reset]);

  const onSubmit: SubmitHandler<ProfileInputs> = async (data) => {
    if (isUpdatingMe) return;

    await updateMe(data);
  };

  const usernameApiError = getApiFieldError(updateMeError, 'username');
  const watchRegionApiError = getApiFieldError(updateMeError, 'watchRegion');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap="5" maxW="2xl">
        <Fieldset.Root size="lg">
          <Fieldset.Content>
            <Field.Root invalid={!!errors.username || !!usernameApiError}>
              <Field.Label>Username</Field.Label>
              <Input type="text" {...register('username', { required: 'Username is required' })} />
              <Field.ErrorText>{errors.username?.message || usernameApiError}</Field.ErrorText>
            </Field.Root>
          </Fieldset.Content>
        </Fieldset.Root>

        <Controller
          control={control}
          name="watchRegion"
          rules={{ required: 'Country is required' }}
          render={({ field }) => (
            <Field.Root invalid={!!errors.watchRegion || !!watchRegionApiError} required>
              <Field.Label>Watch region</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field {...field}>
                  {WATCH_REGIONS.map((region) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
              <Field.HelperText>Used to show streaming availability in your region.</Field.HelperText>
              <Field.ErrorText>{errors.watchRegion?.message || watchRegionApiError}</Field.ErrorText>
            </Field.Root>
          )}
        />

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
