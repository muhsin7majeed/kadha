import { Box, Container, HStack, VStack } from '@chakra-ui/react';
import { LuSettings } from 'react-icons/lu';
import { useLocation } from 'react-router';

import Navbar from '@/components/navbar';
import PageHeader from '@/components/page-header';
import ThemeSettingsSection from '@/features/theme/components/theme-settings-section';
import DataExportSection from '@/features/user/components/data-export-section';

const SettingsContent = ({ hasShellPadding = false }: { hasShellPadding?: boolean }) => {
  return (
    <Container maxW="4xl" px={hasShellPadding ? 0 : undefined} py={hasShellPadding ? 0 : 6}>
      <VStack align="stretch" gap={6}>
        <PageHeader subHeader="Choose how Kadha looks on this device.">
          <HStack gap={2}>
            <LuSettings />
            Settings
          </HStack>
        </PageHeader>

        <ThemeSettingsSection />
        <DataExportSection />
      </VStack>
    </Container>
  );
};

const Settings = () => {
  const location = useLocation();
  const isAppRoute = location.pathname.startsWith('/app');

  return isAppRoute ? (
    <SettingsContent hasShellPadding />
  ) : (
    <Box minH="100vh">
      <Navbar />
      <SettingsContent />
    </Box>
  );
};

export default Settings;
