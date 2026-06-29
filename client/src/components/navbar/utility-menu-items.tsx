import { Box, Menu } from '@chakra-ui/react';
import { LuGithub, LuInfo, LuMoon, LuSun } from 'react-icons/lu';

import { APP_CONFIG } from '@/config/app-config';

import { useColorMode } from '../ui/color-mode';

interface UtilityMenuItemsProps {
  onOpenChangelog: () => void;
}

export const MenuSectionSeparator = () => <Box borderTopWidth="1px" borderColor="border" my={1} />;

const UtilityMenuItems = ({ onOpenChangelog }: UtilityMenuItemsProps) => {
  const { toggleColorMode, colorMode } = useColorMode();

  return (
    <>
      <Menu.Item value="theme" onClick={() => toggleColorMode()}>
        {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
        {colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
      </Menu.Item>

      <Menu.Item
        value="changelog"
        onClick={onOpenChangelog}
        aria-label={`View changelog for Kadha version ${APP_CONFIG.version}`}
      >
        <LuInfo /> Version v{APP_CONFIG.version}
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
