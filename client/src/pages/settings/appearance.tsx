import { Stack } from '@chakra-ui/react';

import ThemeSettingsSection from '@/features/theme/components/theme-settings-section';
import MediaCardSettingsSection from '@/features/media-card-preferences/components/media-card-settings-section';

import SettingsSectionHeader from './settings-section-header';

const AppearanceSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Appearance"
      description="Choose the colors on this device and the media card style saved to your account."
    />
    <ThemeSettingsSection headingAs="h3" />
    <MediaCardSettingsSection />
  </Stack>
);

export default AppearanceSettings;
