import { Stack } from '@chakra-ui/react';
import { useOutletContext } from 'react-router';

import PrivacySettingsSection from '@/features/user/components/privacy-settings-section';
import type { User } from '@/features/user/user.types';

import SettingsSectionHeader from './settings-section-header';

const PrivacySettings = () => {
  const me = useOutletContext<User>();

  return (
    <Stack gap="5">
      <SettingsSectionHeader
        title="Privacy"
        description="Control who can open your profile and see the media activity you share."
      />
      <PrivacySettingsSection me={me} />
    </Stack>
  );
};

export default PrivacySettings;
