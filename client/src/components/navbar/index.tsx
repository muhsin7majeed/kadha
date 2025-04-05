import { useAtom } from 'jotai';
import { Avatar, Box, Button, CloseButton, Dialog, Heading, Menu, Portal } from '@chakra-ui/react';
import { useNavigate } from 'react-router';
import { useState } from 'react';

import { authAtom, clearAuth } from '@/store/auth';

const Navbar = () => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [auth] = useAtom(authAtom);

  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutWarning(true);
  };

  const handleLogoutConfirm = () => {
    clearAuth();
    navigate('/login');
    setShowLogoutWarning(false);
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="Background"
        rounded="md"
        p={'2'}
      >
        <Heading>What to watch</Heading>

        <Box>
          <Menu.Root>
            <Menu.Trigger asChild>
              <Button variant="ghost" unstyled>
                <Avatar.Root>
                  <Avatar.Fallback name={auth.user?.username} />
                  <Avatar.Image />
                </Avatar.Root>
              </Button>
            </Menu.Trigger>

            <Portal>
              <Menu.Positioner>
                <Menu.Content>
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
        </Box>
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
