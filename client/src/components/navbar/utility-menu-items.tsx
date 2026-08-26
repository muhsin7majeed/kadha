import { Box, Menu } from '@chakra-ui/react';
import { LuGithub, LuInfo, LuMoon, LuSettings, LuSun } from 'react-icons/lu';
import { NavLink } from 'react-router';

import { APP_CONFIG } from '@/config/app-config';
import { useColorMode } from '@/components/ui/color-mode-hooks';
import PwaInstallMenuItem from '@/features/pwa/pwa-install-menu-item';

interface UtilityMenuItemsProps {
  settingsPath?: string;
}

export const MenuSectionSeparator = () => <Box borderTopWidth="1px" borderColor="border" my={1} />;

const UtilityMenuItems = ({ settingsPath = '/settings' }: UtilityMenuItemsProps) => {
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <>
      <Menu.Item value="theme" onClick={() => toggleColorMode()}>
        {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
        {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
      </Menu.Item>

      <Menu.Item value="settings" asChild>
        <NavLink to={settingsPath}>
          <LuSettings /> Settings
        </NavLink>
      </Menu.Item>

      <PwaInstallMenuItem />

      <Menu.Item value="release-notes" asChild>
        <a href={`${APP_CONFIG.githubUrl}/releases`} target="_blank" rel="noopener noreferrer">
          <LuInfo /> Version v{APP_CONFIG.version}
        </a>
      </Menu.Item>

      <Menu.Item value="github" asChild>
        <a href={APP_CONFIG.githubUrl} target="_blank" rel="noopener noreferrer">
          <LuGithub /> GitHub
        </a>
      </Menu.Item>
    </>
  );
};

export default UtilityMenuItems;
