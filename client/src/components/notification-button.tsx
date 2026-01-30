import useNotifications from '@/pages/notifications/apis/use-notifications';
import NavLink from './nav-link';
import { Flex, IconButton } from '@chakra-ui/react';
import { LuBell } from 'react-icons/lu';

const NotificationButton = () => {
  const { data: notifications, isLoading: isLoadingNotifications } = useNotifications();

  const unreadNotificationsCount = notifications?.filter((notification) => !notification.read).length;

  return (
    <>
      <NavLink to="/app/notifications" position="relative">
        <IconButton variant="ghost" size="lg" loading={isLoadingNotifications}>
          <LuBell />
        </IconButton>

        <Flex
          justifyContent="center"
          alignItems="center"
          position="absolute"
          top={-1}
          right={-1}
          borderRadius="full"
          color="orange"
          fontSize="xs"
        >
          {unreadNotificationsCount && unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
        </Flex>
      </NavLink>
    </>
  );
};

export default NotificationButton;
