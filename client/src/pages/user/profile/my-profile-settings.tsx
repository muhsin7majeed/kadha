import { Box, Button, Card, Field, Heading, Input, NativeSelect, RadioGroup, Stack, Text } from '@chakra-ui/react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { useEffect } from 'react';

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

const privacyDescriptions: Record<DataPrivacy, string> = {
  [DataPrivacy.Everyone]: 'Anyone who can find your profile can see this.',
  [DataPrivacy.Friends]: 'Only accepted friends can see this.',
  [DataPrivacy.OnlyMe]: 'Only you can see this.',
};

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingsSection = ({ title, description, children }: SettingsSectionProps) => (
  <Card.Root variant="outline">
    <Card.Header pb="3">
      <Heading as="h2" textStyle="lg">
        {title}
      </Heading>
      <Text color="fg.muted" textStyle="sm">
        {description}
      </Text>
    </Card.Header>

    <Card.Body pt="0">
      <Stack gap="5">{children}</Stack>
    </Card.Body>
  </Card.Root>
);

interface PrivacyRadioGroupProps extends RadioGroup.RootProps {
  options: typeof DATA_PRIVACY_OPTIONS;
}

const PrivacyRadioGroup = ({ options, ...props }: PrivacyRadioGroupProps) => (
  <RadioGroup.Root {...props}>
    <Stack gap="3">
      {options.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          alignItems="flex-start"
          border="1px solid"
          borderColor="border.muted"
          borderRadius="md"
          p="3"
        >
          <RadioGroup.ItemHiddenInput />
          <RadioGroup.ItemIndicator mt="0.5" />
          <RadioGroup.ItemText>
            <Stack gap="1">
              <Text fontWeight="medium">{option.label}</Text>
              <Text color="fg.muted" textStyle="sm">
                {privacyDescriptions[option.value]}
              </Text>
            </Stack>
          </RadioGroup.ItemText>
        </RadioGroup.Item>
      ))}
    </Stack>
  </RadioGroup.Root>
);

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
      <Stack gap="5" maxW="3xl">
        <SettingsSection
          title="Account"
          description="Keep your public name and regional watch availability accurate."
        >
          <Field.Root invalid={!!errors.username || !!usernameApiError} required>
            <Field.Label>Username</Field.Label>
            <Input type="text" {...register('username', { required: 'Username is required' })} />
            <Field.HelperText>This is how other people find and recognize you.</Field.HelperText>
            <Field.ErrorText>{errors.username?.message || usernameApiError}</Field.ErrorText>
          </Field.Root>

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
        </SettingsSection>

        <SettingsSection title="Visibility" description="Choose who can see your profile and media activity.">
          <Controller
            control={control}
            name="profilePrivacy"
            render={({ field }) => (
              <Field.Root>
                <Field.Label>Profile</Field.Label>
                <Field.HelperText>Controls whether your profile page itself can be opened.</Field.HelperText>
                <PrivacyRadioGroup options={PROFILE_PRIVACY_OPTIONS} {...field} />
              </Field.Root>
            )}
          />

          <Box borderTop="1px solid" borderColor="border.muted" pt="5">
            <Controller
              control={control}
              name="watchedPrivacy"
              render={({ field }) => (
                <Field.Root>
                  <Field.Label>Watched list</Field.Label>
                  <Field.HelperText>Controls visibility for movies and shows marked as watched.</Field.HelperText>
                  <PrivacyRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
                </Field.Root>
              )}
            />
          </Box>

          <Box borderTop="1px solid" borderColor="border.muted" pt="5">
            <Controller
              control={control}
              name="likedPrivacy"
              render={({ field }) => (
                <Field.Root>
                  <Field.Label>Liked list</Field.Label>
                  <Field.HelperText>Controls visibility for movies and shows you liked.</Field.HelperText>
                  <PrivacyRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
                </Field.Root>
              )}
            />
          </Box>

          <Box borderTop="1px solid" borderColor="border.muted" pt="5">
            <Controller
              control={control}
              name="watchlistPrivacy"
              render={({ field }) => (
                <Field.Root>
                  <Field.Label>Watchlist</Field.Label>
                  <Field.HelperText>Controls visibility for movies and shows you plan to watch.</Field.HelperText>
                  <PrivacyRadioGroup options={DATA_PRIVACY_OPTIONS} {...field} />
                </Field.Root>
              )}
            />
          </Box>
        </SettingsSection>

        <Button
          type="submit"
          variant="solid"
          colorPalette="brand"
          loading={isUpdatingMe}
          disabled={isUpdatingMe}
          alignSelf={{ base: 'stretch', sm: 'start' }}
        >
          Update Profile
        </Button>
      </Stack>
    </form>
  );
};

export default MyProfileSettings;
