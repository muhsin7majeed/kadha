import { Box, Container, Grid, HStack, VStack } from '@chakra-ui/react';
import { LuSettings } from 'react-icons/lu';
import { Outlet, useLocation } from 'react-router';

import Navbar from '@/components/navbar';
import PageHeader from '@/components/page-header';
import SettingsNavigation from '@/features/settings/components/settings-navigation';
import ThemeSettingsSection from '@/features/theme/components/theme-settings-section';
import { useAuth } from '@/features/auth/use-auth';

const SettingsTitle = () => (
  <HStack as="span" gap={2}>
    <LuSettings aria-hidden />
    Settings
  </HStack>
);

const Settings = () => {
  const location = useLocation();
  const auth = useAuth();
  const isAppRoute = location.pathname.startsWith('/app');

  if (!isAppRoute) {
    return (
      <Box minH="100vh">
        <Navbar />

        <Container maxW="4xl" py="6">
          <VStack align="stretch" gap="6">
            <PageHeader subHeader="Choose how Kadha looks on this device.">
              <SettingsTitle />
            </PageHeader>
            <ThemeSettingsSection />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (!auth.user) {
    return null;
  }

  return (
    <Container maxW="6xl" px="0">
      <VStack align="stretch" gap="6">
        <PageHeader subHeader="Manage your account, privacy, appearance, security, and data.">
          <SettingsTitle />
        </PageHeader>

        <Grid templateColumns={{ base: 'minmax(0, 1fr)', md: '12rem minmax(0, 1fr)' }} gap={{ base: '5', md: '8' }}>
          <SettingsNavigation />
          <Box minW="0">
            <Outlet context={auth.user} />
          </Box>
        </Grid>
      </VStack>
    </Container>
  );
};

export default Settings;
