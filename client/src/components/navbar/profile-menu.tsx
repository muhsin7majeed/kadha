import { Button, Menu, Portal } from '@chakra-ui/react';
import SimpleAvatar from '../simple-avatar';
import { NavLink } from 'react-router';
import useLogout from '@/features/auth/api/use-logout';
import { useState } from 'react';
import ConfirmationDialog from '../dialogs/confirmation-dialog';
import { LuBell, LuLayoutDashboard, LuLogOut, LuUser, LuUsers } from 'react-icons/lu';
import { APP_CONFIG } from '@/config/app-config';
import ChangelogDialog from '@/features/changelog/changelog-dialog';
import UtilityMenuItems, { MenuSectionSeparator } from './utility-menu-items';
import { UserRole } from '@/types/common';
import { useAuth } from '@/features/auth/use-auth';
import { clearSession } from '@/features/auth/session';

const ProfileMenu = () => {
  const [showLogoutWarning, setShowLogoutWarning] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  const auth = useAuth();
  const isAdmin = auth.user?.role === UserRole.Admin;

  const { mutateAsync: logoutMutation } = useLogout();

  const logout = async () => {
    try {
      await logoutMutation();
    } finally {
      await clearSession();
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

              {isAdmin && (
                <Menu.Item value="admin" asChild>
                  <NavLink to="/app/admin">
                    <LuLayoutDashboard /> Admin
                  </NavLink>
                </Menu.Item>
              )}

              <MenuSectionSeparator />

              <UtilityMenuItems onOpenChangelog={() => setShowChangelog(true)} settingsPath="/app/settings" />

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
