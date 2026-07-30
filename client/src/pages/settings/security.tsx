import { Stack } from '@chakra-ui/react';

import AccountRecoverySection from '@/features/auth/components/account-recovery-section';

import SettingsSectionHeader from './settings-section-header';

const SecuritySettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader
      title="Security"
      description="Protect access to your account and maintain a safe recovery method."
    />
    <AccountRecoverySection headingAs="h3" />
  </Stack>
);

export default SecuritySettings;
