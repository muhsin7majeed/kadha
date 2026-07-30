import { Box, Button, Card, Field, Heading, RadioGroup, SimpleGrid, Stack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { DATA_PRIVACY_OPTIONS, PROFILE_PRIVACY_OPTIONS } from '@/constants/common';
import useUpdateMe from '@/features/user/api/use-update-me';
import { getUpdateUserPayload } from '@/features/user/user-settings';
import type { User } from '@/features/user/user.types';
import { DataPrivacy } from '@/types/common';

interface PrivacyInputs {
  profilePrivacy: DataPrivacy;
  watchedPrivacy: DataPrivacy;
  likedPrivacy: DataPrivacy;
  watchlistPrivacy: DataPrivacy;
}

type PrivacyFieldName = keyof PrivacyInputs;

interface PrivacySetting {
  description: string;
  label: string;
  name: PrivacyFieldName;
  options: ReadonlyArray<{
    label: string;
    value: DataPrivacy;
  }>;
}

const privacySettings: PrivacySetting[] = [
  {
    name: 'profilePrivacy',
    label: 'Profile',
    description: 'Controls whether your profile page itself can be opened.',
    options: PROFILE_PRIVACY_OPTIONS,
  },
  {
    name: 'watchedPrivacy',
    label: 'Watched list',
    description: 'Controls visibility for movies and shows marked as watched.',
    options: DATA_PRIVACY_OPTIONS,
  },
  {
    name: 'likedPrivacy',
    label: 'Liked list',
    description: 'Controls visibility for movies and shows you liked.',
    options: DATA_PRIVACY_OPTIONS,
  },
  {
    name: 'watchlistPrivacy',
    label: 'Watchlist',
    description: 'Controls visibility for movies and shows you plan to watch.',
    options: DATA_PRIVACY_OPTIONS,
  },
];

interface PrivacyRadioGroupProps {
  ariaLabel: string;
  disabled: boolean;
  name: string;
  onBlur: () => void;
  onChange: (value: DataPrivacy) => void;
  options: PrivacySetting['options'];
  value: DataPrivacy;
}

const PrivacyRadioGroup = ({
  ariaLabel,
  disabled,
  name,
  onBlur,
  onChange,
  options,
  value,
}: PrivacyRadioGroupProps) => (
  <RadioGroup.Root
    aria-label={ariaLabel}
    disabled={disabled}
    name={name}
    value={value}
    onBlur={onBlur}
    onValueChange={(details) => onChange(details.value as DataPrivacy)}
  >
    <SimpleGrid columns={3} gap="2">
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <RadioGroup.Item
            key={option.value}
            value={option.value}
            alignItems="center"
            bg={isSelected ? 'brand.subtle' : 'transparent'}
            borderWidth="1px"
            borderColor={isSelected ? 'brand.solid' : 'border.muted'}
            borderRadius="md"
            cursor={disabled ? 'not-allowed' : 'pointer'}
            justifyContent="center"
            minW="0"
            px={{ base: '2', sm: '3' }}
            py="2.5"
          >
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator flexShrink="0" />
            <RadioGroup.ItemText textStyle="compactLabel" textAlign="center">
              {option.label}
            </RadioGroup.ItemText>
          </RadioGroup.Item>
        );
      })}
    </SimpleGrid>
  </RadioGroup.Root>
);

interface PrivacySettingsSectionProps {
  me: User;
}

const PrivacySettingsSection = ({ me }: PrivacySettingsSectionProps) => {
  const { mutateAsync: updateMe, isPending: isUpdatingMe } = useUpdateMe();
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<PrivacyInputs>({
    defaultValues: {
      profilePrivacy: me.profilePrivacy,
      watchedPrivacy: me.watchedPrivacy,
      likedPrivacy: me.likedPrivacy,
      watchlistPrivacy: me.watchlistPrivacy,
    },
  });

  useEffect(() => {
    reset({
      profilePrivacy: me.profilePrivacy,
      watchedPrivacy: me.watchedPrivacy,
      likedPrivacy: me.likedPrivacy,
      watchlistPrivacy: me.watchlistPrivacy,
    });
  }, [me, reset]);

  const onSubmit: SubmitHandler<PrivacyInputs> = async (data) => {
    if (isUpdatingMe) return;

    await updateMe({
      ...getUpdateUserPayload(me),
      ...data,
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card.Root variant="outline">
        <Card.Header pb="3">
          <Heading as="h3" textStyle="subsectionTitle">
            Visibility
          </Heading>
        </Card.Header>

        <Card.Body pt="0">
          <Stack gap="5">
            <Stack gap="0">
              {privacySettings.map((setting, index) => (
                <Box
                  key={setting.name}
                  borderTopWidth={index === 0 ? '0' : '1px'}
                  borderColor="border.muted"
                  py="5"
                  _first={{ pt: '0' }}
                >
                  <Controller
                    control={control}
                    name={setting.name}
                    render={({ field }) => (
                      <Field.Root>
                        <Field.Label>{setting.label}</Field.Label>
                        <Field.HelperText mb="3">{setting.description}</Field.HelperText>
                        <PrivacyRadioGroup
                          ariaLabel={`${setting.label} visibility`}
                          disabled={isUpdatingMe}
                          name={field.name}
                          onBlur={field.onBlur}
                          onChange={field.onChange}
                          options={setting.options}
                          value={field.value}
                        />
                      </Field.Root>
                    )}
                  />
                </Box>
              ))}
            </Stack>

            <Button
              type="submit"
              colorPalette="brand"
              loading={isUpdatingMe}
              disabled={isUpdatingMe || !isDirty}
              alignSelf={{ base: 'stretch', sm: 'start' }}
            >
              Save privacy settings
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </form>
  );
};

export default PrivacySettingsSection;
