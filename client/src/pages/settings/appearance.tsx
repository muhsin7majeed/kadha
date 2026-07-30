import { Stack } from '@chakra-ui/react';

import ThemeSettingsSection from '@/features/theme/components/theme-settings-section';

import SettingsSectionHeader from './settings-section-header';

const AppearanceSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Appearance"
      description="Choose the color mode and accent palette used on this device."
    />
    <ThemeSettingsSection headingAs="h3" />
  </Stack>
);

export default AppearanceSettings;
