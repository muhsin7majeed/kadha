import { Button, Card, Field, Heading, Input, NativeSelect, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { WATCH_REGIONS } from '@/constants/watch-regions';
import useUpdateMe from '@/features/user/api/use-update-me';
import { getUpdateUserPayload } from '@/features/user/user-settings';
import type { User } from '@/features/user/user.types';
import { getApiFieldError } from '@/hooks/use-error-handler';

interface AccountInputs {
  username: string;
  watchRegion: string;
}

interface AccountSettingsSectionProps {
  me: User;
}

const AccountSettingsSection = ({ me }: AccountSettingsSectionProps) => {
  const { mutateAsync: updateMe, isPending: isUpdatingMe, error: updateMeError } = useUpdateMe();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<AccountInputs>({
    defaultValues: {
      username: me.username,
      watchRegion: me.watchRegion,
    },
  });

  useEffect(() => {
    reset({
      username: me.username,
      watchRegion: me.watchRegion,
    });
  }, [me, reset]);

  const onSubmit: SubmitHandler<AccountInputs> = async (data) => {
    if (isUpdatingMe) return;

    await updateMe({
      ...getUpdateUserPayload(me),
      ...data,
    });
  };

  const usernameApiError = getApiFieldError(updateMeError, 'username');
  const watchRegionApiError = getApiFieldError(updateMeError, 'watchRegion');

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card.Root variant="outline">
        <Card.Header pb="3">
          <Heading as="h3" textStyle="subsectionTitle">
            Profile and region
          </Heading>
        </Card.Header>

        <Card.Body pt="0">
          <Stack gap="5">
            <Field.Root invalid={Boolean(errors.username || usernameApiError)} required>
              <Field.Label>Username</Field.Label>
              <Input type="text" disabled={isUpdatingMe} {...register('username', { required: 'Username is required' })} />
              <Field.HelperText>This is how other people find and recognize you.</Field.HelperText>
              <Field.ErrorText>{errors.username?.message || usernameApiError}</Field.ErrorText>
            </Field.Root>

            <Controller
              control={control}
              name="watchRegion"
              rules={{ required: 'Country is required' }}
              render={({ field }) => (
                <Field.Root invalid={Boolean(errors.watchRegion || watchRegionApiError)} required>
                  <Field.Label>Watch region</Field.Label>
                  <NativeSelect.Root disabled={isUpdatingMe}>
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

            <Button
              type="submit"
              colorPalette="brand"
              loading={isUpdatingMe}
              disabled={isUpdatingMe || !isDirty}
              alignSelf={{ base: 'stretch', sm: 'start' }}
            >
              Save account settings
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </form>
  );
};

export default AccountSettingsSection;
