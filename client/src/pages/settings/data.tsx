import { Stack } from '@chakra-ui/react';

import DataExportSection from '@/features/user/components/data-export-section';
import DeleteAccountSection from '@/features/user/components/delete-account-section';

import SettingsSectionHeader from './settings-section-header';

const DataSettings = () => (
  <Stack gap="5">
    <SettingsSectionHeader title="Data" description="Download and manage the information stored in your account." />
    <DataExportSection headingAs="h3" />
    <DeleteAccountSection headingAs="h3" />
  </Stack>
);

export default DataSettings;
