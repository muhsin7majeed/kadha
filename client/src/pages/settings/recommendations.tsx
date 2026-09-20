import { Stack } from '@chakra-ui/react';

import { APP_CONFIG } from '@/config/app-config';
import RecommendationSettingsSection from '@/features/recommendations/components/recommendation-settings-section';

import SettingsSectionHeader from './settings-section-header';

const RecommendationSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Recommendations"
      description={`Control the private signals ${APP_CONFIG.appName} uses to suggest movies and shows for you.`}
    />
    <RecommendationSettingsSection />
  </Stack>
);

export default RecommendationSettings;
