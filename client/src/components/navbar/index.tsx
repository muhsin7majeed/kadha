import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  CloseButton,
  Container,
  Dialog,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Link as ChakraLink,
  Menu,
  Portal,
} from '@chakra-ui/react';
import { LuGithub, LuMoon, LuSun, LuTv } from 'react-icons/lu';
import { Link } from 'react-router';
import { useColorMode } from '@/components/ui/color-mode';
import { useAuthAtom, useSetAuthAtom } from '@/atoms/auth-atom';
import { removeAccessToken } from '@/lib/token-manager';
import useLogout from '@/pages/auth/apis/use-logout';
import NavLink from '../nav-link';

const GITHUB_URL = 'https://github.com/muhsin7majeed/what-to-watch-web';

const Navbar = () => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [auth] = useAuthAtom();
  const setAuth = useSetAuthAtom();
  const { toggleColorMode, colorMode } = useColorMode();

  const { mutateAsync: logoutMutation } = useLogout();

  const isAuthenticated = auth.status === 'authenticated';

  const logout = async () => {
    await logoutMutation();

    removeAccessToken();

    setAuth({
      user: null,
      status: 'unauthenticated',
    });
  };

  const handleLogout = () => {
    setShowLogoutWarning(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutWarning(false);
    logout();
  };

  return (
    <>
      <Box as="nav" position="sticky" top={0} zIndex={10} bg="bg" borderBottomWidth="1px" borderColor="border">
        <Container maxW="6xl" py={4}>
          <Flex justify="space-between" align="center">
            <HStack gap={2} asChild>
              <Link to={isAuthenticated ? '/home' : '/'}>
                <Icon fontSize="2xl" color="orange">
                  <LuTv />
                </Icon>
                <Heading size="lg">What to Watch</Heading>
              </Link>
            </HStack>

            <HStack gap={2}>
              <IconButton variant="ghost" size="sm" onClick={() => toggleColorMode()}>
                {colorMode === 'dark' ? <LuSun /> : <LuMoon />}
              </IconButton>

              <ChakraLink asChild>
                <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <IconButton variant="ghost" size="sm">
                    <LuGithub />
                  </IconButton>
                </a>
              </ChakraLink>

              {isAuthenticated ? (
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button variant="ghost" unstyled>
                      <Avatar.Root>
                        <Avatar.Fallback name={auth.user?.username || 'User'} />
                        <Avatar.Image />
                      </Avatar.Root>
                    </Button>
                  </Menu.Trigger>

                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value="profile" asChild>
                          <NavLink to="/app/profile">{auth.user?.username}</NavLink>
                        </Menu.Item>

                        <Menu.Item
                          value="logout"
                          onClick={handleLogout}
                          color="fg.error"
                          _hover={{ bg: 'bg.error', color: 'fg.error' }}
                        >
                          Logout
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild display={{ base: 'none', sm: 'flex' }}>
                    <Link to="/auth/login">Login</Link>
                  </Button>

                  <Button colorPalette="orange" size="sm" asChild display={{ base: 'none', sm: 'flex' }}>
                    <Link to="/auth/register">Sign Up</Link>
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Dialog.Root
        lazyMount
        open={showLogoutWarning}
        onOpenChange={(e) => setShowLogoutWarning(e.open)}
        role="alertdialog"
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>Logout</Dialog.Title>
              </Dialog.Header>

              <Dialog.Body>Are you sure you want to logout?</Dialog.Body>

              <Dialog.Footer colorPalette="red">
                <Button onClick={handleLogoutConfirm}>Confirm</Button>
              </Dialog.Footer>

              <Dialog.CloseTrigger asChild>
                <CloseButton size="sm" />
              </Dialog.CloseTrigger>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  );
};

export default Navbar;
