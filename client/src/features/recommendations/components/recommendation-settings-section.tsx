import { Alert, Box, Button, Card, Checkbox, Heading, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useEffect } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { LuRefreshCcw } from 'react-icons/lu';

import useRecommendationSettings from '@/features/recommendations/api/use-recommendation-settings';
import useUpdateRecommendationSettings from '@/features/recommendations/api/use-update-recommendation-settings';
import {
  useResetRecommendationFeedback,
  useResetRecommendationSettings,
} from '@/features/recommendations/api/use-reset-recommendations';
import type { RecommendationSettings } from '@/features/recommendations/recommendations.types';

interface RecommendationSettingOption {
  name: keyof RecommendationSettings;
  label: string;
  description: string;
}

const signalOptions: RecommendationSettingOption[] = [
  {
    name: 'useLiked',
    label: 'Liked titles',
    description: 'Use titles you liked as a strong positive taste signal.',
  },
  {
    name: 'useRatings',
    label: 'Ratings',
    description: 'Use high ratings as positive signals and low ratings as negative signals.',
  },
  {
    name: 'useWatched',
    label: 'Watched titles',
    description: 'Use watched titles as a weak signal. Watched recommendations are still excluded by default.',
  },
  {
    name: 'useRewatchHistory',
    label: 'Rewatch history',
    description: 'Use repeat watches as a strong signal, capped so one title does not dominate.',
  },
  {
    name: 'useWatchlist',
    label: 'Watchlist',
    description: 'Optional. Watchlist reflects future interest, not proven taste, so it may skew recommendations.',
  },
];

const resultOptions: RecommendationSettingOption[] = [
  {
    name: 'excludeWatched',
    label: 'Exclude watched titles',
    description: 'Keep recommendations focused on things you have not already watched.',
  },
];

interface SettingsCheckboxProps {
  description: string;
  disabled: boolean;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const SettingsCheckbox = ({ description, disabled, label, onChange, value }: SettingsCheckboxProps) => (
  <Checkbox.Root
    checked={value}
    disabled={disabled}
    onCheckedChange={(details) => onChange(details.checked === true)}
    alignItems="flex-start"
    borderWidth="1px"
    borderColor={value ? 'brand.solid' : 'border.muted'}
    bg={value ? 'brand.subtle' : 'transparent'}
    borderRadius="lg"
    p="4"
  >
    <Checkbox.HiddenInput />
    <Checkbox.Control mt="0.5" />
    <Box>
      <Checkbox.Label fontWeight="medium">{label}</Checkbox.Label>
      <Text color="fg.muted" textStyle="supporting" mt="1">
        {description}
      </Text>
    </Box>
  </Checkbox.Root>
);

const RecommendationSettingsSection = () => {
  const { data: settings, isLoading } = useRecommendationSettings();
  const { mutateAsync: updateSettings, isPending: isUpdating } = useUpdateRecommendationSettings();
  const { mutate: resetFeedback, isPending: isResettingFeedback } = useResetRecommendationFeedback();
  const { mutate: resetSettings, isPending: isResettingSettings } = useResetRecommendationSettings();
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<RecommendationSettings>({
    defaultValues: {
      useLiked: true,
      useRatings: true,
      useWatched: true,
      useRewatchHistory: true,
      useWatchlist: false,
      excludeWatched: true,
    },
  });
  const useWatchlist = watch('useWatchlist');

  useEffect(() => {
    if (!settings) return;
    reset(settings);
  }, [reset, settings]);

  const onSubmit: SubmitHandler<RecommendationSettings> = async (data) => {
    await updateSettings(data);
    reset(data);
  };

  const controlsDisabled = isLoading || isUpdating || isResettingFeedback || isResettingSettings;

  return (
    <Stack gap="5">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card.Root variant="outline">
          <Card.Header>
            <Heading as="h3" textStyle="subsectionTitle">
              Recommendation inputs
            </Heading>
            <Text color="fg.muted" textStyle="supporting">
              Choose which private tracking signals Kadha can use for recommendations. These settings affect only your
              own account.
            </Text>
          </Card.Header>

          <Card.Body pt="0">
            <Stack gap="5">
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
                {signalOptions.map((option) => (
                  <Controller
                    key={option.name}
                    control={control}
                    name={option.name}
                    render={({ field }) => (
                      <SettingsCheckbox
                        label={option.label}
                        description={option.description}
                        disabled={controlsDisabled}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                ))}
              </SimpleGrid>

              {useWatchlist && (
                <Alert.Root status="warning" role="alert">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>Watchlist can skew recommendations</Alert.Title>
                    <Alert.Description>
                      Watchlist items are things you may want to try, not proof that you enjoyed similar titles.
                    </Alert.Description>
                  </Alert.Content>
                </Alert.Root>
              )}

              <Box borderTopWidth="1px" borderColor="border.muted" pt="5">
                <Stack gap="3">
                  <Heading as="h4" textStyle="cardTitle">
                    Result filtering
                  </Heading>
                  {resultOptions.map((option) => (
                    <Controller
                      key={option.name}
                      control={control}
                      name={option.name}
                      render={({ field }) => (
                        <SettingsCheckbox
                          label={option.label}
                          description={option.description}
                          disabled={controlsDisabled}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                  ))}
                </Stack>
              </Box>

              <Button
                type="submit"
                colorPalette="brand"
                loading={isUpdating}
                disabled={controlsDisabled || !isDirty}
                alignSelf={{ base: 'stretch', sm: 'start' }}
              >
                Save recommendation settings
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>
      </form>

      <Card.Root variant="outline">
        <Card.Header>
          <Heading as="h3" textStyle="subsectionTitle">
            Reset recommendations
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            Reset tuning feedback separately from your signal settings.
          </Text>
        </Card.Header>
        <Card.Body pt="0">
          <Stack direction={{ base: 'column', sm: 'row' }} gap="3">
            <Button
              variant="outline"
              colorPalette="gray"
              loading={isResettingFeedback}
              disabled={controlsDisabled}
              onClick={() => resetFeedback()}
            >
              <LuRefreshCcw />
              Reset feedback
            </Button>
            <Button
              variant="outline"
              colorPalette="gray"
              loading={isResettingSettings}
              disabled={controlsDisabled}
              onClick={() => resetSettings()}
            >
              <LuRefreshCcw />
              Restore settings defaults
            </Button>
          </Stack>
        </Card.Body>
      </Card.Root>
    </Stack>
  );
};

export default RecommendationSettingsSection;
