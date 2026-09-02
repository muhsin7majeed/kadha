import { Stack } from '@chakra-ui/react';

import RecommendationSettingsSection from '@/features/recommendations/components/recommendation-settings-section';

import SettingsSectionHeader from './settings-section-header';

const RecommendationSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Recommendations"
      description="Control the private signals Kadha uses to suggest movies and shows for you."
    />
    <RecommendationSettingsSection />
  </Stack>
);

export default RecommendationSettings;
