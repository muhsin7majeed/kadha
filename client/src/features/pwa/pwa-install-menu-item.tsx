import { useState } from 'react';
import { Button, List, Menu, Stack, Text } from '@chakra-ui/react';
import { LuDownload } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import { APP_CONFIG } from '@/config/app-config';

import { usePwaInstall } from './use-pwa-install';

const PwaInstallMenuItem = () => {
  const { installMethod, requestInstall } = usePwaInstall();
  const [showIosInstructions, setShowIosInstructions] = useState(false);

  if (!installMethod) return null;

  const handleInstall = () => {
    if (installMethod === 'ios') {
      setShowIosInstructions(true);
      return;
    }

    void requestInstall();
  };

  return (
    <>
      <SimpleDialog
        closeButton
        open={showIosInstructions}
        onOpenChange={(details) => setShowIosInstructions(details.open)}
        title={`Install ${APP_CONFIG.appName}`}
        contentProps={{ maxW: 'md' }}
        footer={
          <Button colorPalette="gray" variant="outline" onClick={() => setShowIosInstructions(false)}>
            Done
          </Button>
        }
      >
        <Stack gap={3}>
          <Text textStyle="body">Add {APP_CONFIG.appName} to your Home Screen from your browser:</Text>

          <List.Root as="ol" ps={5} gap={2} textStyle="body">
            <List.Item>Open the Share menu.</List.Item>
            <List.Item>Choose Add to Home Screen.</List.Item>
            <List.Item>Leave Open as Web App enabled, then tap Add.</List.Item>
          </List.Root>

          <Text color="fg.muted" textStyle="supporting">
            The installed app still needs a connection to load and update your library.
          </Text>
        </Stack>
      </SimpleDialog>

      <Menu.Item value="install-app" onClick={handleInstall}>
        <LuDownload /> Install {APP_CONFIG.appName}
      </Menu.Item>
    </>
  );
};

export default PwaInstallMenuItem;
