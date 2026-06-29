import { Button, Menu, Portal } from '@chakra-ui/react';
import SimpleAvatar from '../simple-avatar';
import { NavLink } from 'react-router';
import useLogout from '@/features/auth/api/use-logout';
import { removeAccessToken } from '@/lib/token-manager';
import { useAuthAtom, useSetAuthAtom } from '@/atoms/auth-atom';
import { useState } from 'react';
import ConfirmationDialog from '../dialogs/confirmation-dialog';
import { LuBell, LuLogOut, LuUser, LuUsers } from 'react-icons/lu';
import { useQueryClient } from '@tanstack/react-query';
import { APP_CONFIG } from '@/config/app-config';
import ChangelogDialog from '@/features/changelog/changelog-dialog';
import UtilityMenuItems, { MenuSectionSeparator } from './utility-menu-items';

const ProfileMenu = () => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const [auth] = useAuthAtom();

  const setAuth = useSetAuthAtom();
  const queryClient = useQueryClient();
  const { mutateAsync: logoutMutation } = useLogout();

  const logout = async () => {
    try {
      await logoutMutation();
    } finally {
      removeAccessToken();
      queryClient.clear();

      setAuth({
        user: null,
        status: 'unauthenticated',
      });
    }
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

      <ChangelogDialog version={APP_CONFIG.version} open={showChangelog} onOpenChange={setShowChangelog} />

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

              <Menu.Item value="notifications" asChild>
                <NavLink to="/app/notifications">
                  <LuBell /> Notifications
                </NavLink>
              </Menu.Item>

              <MenuSectionSeparator />

              <UtilityMenuItems onOpenChangelog={() => setShowChangelog(true)} />

              <MenuSectionSeparator />

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
