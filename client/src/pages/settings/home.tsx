import { Stack } from '@chakra-ui/react';

import HomeSettingsSection from '@/features/home/components/home-settings-section';
import SettingsSectionHeader from './settings-section-header';

const HomeSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Home"
      description="Choose which sections appear on Home and put them in the order that helps you decide what to watch next."
    />
    <HomeSettingsSection />
  </Stack>
);

export default HomeSettings;
