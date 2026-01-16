import { useState } from 'react';
import { Avatar, Box, Button, CloseButton, Container, Dialog, Heading, Menu, Portal } from '@chakra-ui/react';

import { useAuthAtom } from '@/atoms/authAtom';
import { useLogout } from '@/lib/auth';

const Navbar = () => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const auth = useAuthAtom();

  const logout = useLogout();

  const handleLogout = () => {
    setShowLogoutWarning(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutWarning(false);
    logout();
  };

  return (
    <>
      <Box backgroundColor="Background" rounded="md" py={'2'} px={[2, 4]} m={[2, 4]} borderRadius="lg">
        <Container display="flex" justifyContent="space-between" alignItems="center">
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
