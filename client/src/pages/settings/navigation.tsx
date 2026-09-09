import { Stack } from '@chakra-ui/react';

import NavigationSettingsSection from '@/features/navigation/components/navigation-settings-section';
import SettingsSectionHeader from './settings-section-header';

const NavigationSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Navigation"
      description="Choose which destinations stay close, how they appear, and where they are ordered."
    />
    <NavigationSettingsSection />
  </Stack>
);

export default NavigationSettings;
