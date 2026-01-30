import { Button, Menu, Portal } from '@chakra-ui/react';
import SimpleAvatar from '../simple-avatar';
import { NavLink } from 'react-router';
import useLogout from '@/pages/auth/apis/use-logout';
import { removeAccessToken } from '@/lib/token-manager';
import { useAuthAtom, useSetAuthAtom } from '@/atoms/auth-atom';
import { useState } from 'react';
import ConfirmationDialog from '../dialogs/confirmation-dialog';
import { LuLogOut, LuUser, LuUsers } from 'react-icons/lu';

const ProfileMenu = () => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);

  const [auth] = useAuthAtom();

  const setAuth = useSetAuthAtom();
  const { mutateAsync: logoutMutation } = useLogout();

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
      <ConfirmationDialog
        isOpen={showLogoutWarning}
        onOpenChange={setShowLogoutWarning}
        title="Logout"
        description="Are you sure you want to logout?"
        onConfirm={handleLogoutConfirm}
        confirmButtonText="Confirm"
        cancelButtonText="Cancel"
        confirmButtonProps={{ colorPalette: 'red' }}
      />

      <Menu.Root>
        <Menu.Trigger asChild>
          <Button unstyled cursor="pointer">
            <SimpleAvatar fallbackName={auth.user?.username} />
          </Button>
        </Menu.Trigger>

        <Portal>
          <Menu.Positioner>
            <Menu.Content>
              <Menu.Item value="profile" asChild>
                <NavLink to="/app/profile">
                  <LuUser /> {auth.user?.username}
                </NavLink>
              </Menu.Item>

              <Menu.Item value="friends" asChild>
                <NavLink to="/app/friends">
                  <LuUsers /> Friends
                </NavLink>
              </Menu.Item>

              <Menu.Item
                value="logout"
                onClick={handleLogout}
                color="fg.error"
                _hover={{ bg: 'bg.error', color: 'fg.error' }}
              >
                <LuLogOut /> Logout
              </Menu.Item>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Menu.Root>
    </>
  );
};

export default ProfileMenu;
