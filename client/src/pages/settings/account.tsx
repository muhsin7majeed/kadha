import { Stack } from '@chakra-ui/react';
import { useOutletContext } from 'react-router';

import AccountSettingsSection from '@/features/user/components/account-settings-section';
import type { User } from '@/features/user/user.types';

import SettingsSectionHeader from './settings-section-header';

const AccountSettings = () => {
  const me = useOutletContext<User>();

  return (
    <Stack gap="5">
      <SettingsSectionHeader
        title="Account"
        description="Manage the details Kadha uses for your profile and streaming availability."
      />
      <AccountSettingsSection me={me} />
    </Stack>
  );
};

export default AccountSettings;
