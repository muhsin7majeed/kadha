import { useState } from 'react';
import { Box, Button, Container, Flex, Heading, HStack, Icon, IconButton, Menu, Portal } from '@chakra-ui/react';
import { LuMenu, LuTv } from 'react-icons/lu';
import { Link } from 'react-router';
import { useAuthAtom } from '@/atoms/auth-atom';
import { APP_CONFIG } from '@/config/app-config';
import ChangelogDialog from '@/features/changelog/changelog-dialog';
import GlobalSearchDialog from '@/features/search/global-search-dialog';

import NotificationButton from '../notification-button';
import ProfileMenu from './profile-menu';
import UtilityMenuItems from './utility-menu-items';

const UtilityMenu = () => {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <>
      <ChangelogDialog version={APP_CONFIG.version} open={showChangelog} onOpenChange={setShowChangelog} />

      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant="ghost" size="sm" aria-label="Open menu">
            <LuMenu />
          </IconButton>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <UtilityMenuItems onOpenChangelog={() => setShowChangelog(true)} />
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  );
};

const Navbar = () => {
  const [auth] = useAuthAtom();

  const isAuthenticated = auth.status === 'authenticated';

  return (
    <>
      <Box as="nav" position="sticky" top={0} zIndex={10} bg="bg" borderBottomWidth="1px" borderColor="border">
        <Container maxW="6xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack gap={2} minW={0} asChild>
              <Link to={isAuthenticated ? '/app' : '/'}>
                <Icon fontSize={['sm', '2xl']} color="brand.fg">
                  <LuTv />
                </Icon>
                <Heading size={['sm', 'lg']} truncate maxW={{ base: '42vw', sm: 'none' }}>
                  {APP_CONFIG.appName}
                </Heading>
              </Link>
            </HStack>

            <HStack gap={2} flexShrink={0}>
              {isAuthenticated ? (
                <Flex gap={1} align="center">
                  <GlobalSearchDialog />

                  <NotificationButton />

                  <ProfileMenu />
                </Flex>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild display={{ base: 'none', sm: 'flex' }}>
                    <Link to="/auth/login">Login</Link>
                  </Button>

                  <Button colorPalette="brand" size="sm" asChild>
                    <Link to="/auth/register">Sign Up</Link>
                  </Button>

                  <UtilityMenu />
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Navbar;
