import useUnreadNotificationsCount from '@/features/notifications/api/use-unread-notifications-count';
import NavLink from './nav-link';
import { Flex, IconButton } from '@chakra-ui/react';
import { LuBell } from 'react-icons/lu';

const NotificationButton = () => {
  const { data, isLoading } = useUnreadNotificationsCount();

  const unreadNotificationsCount = data?.count ?? 0;

  return (
    <>
      <NavLink to="/app/notifications" position="relative">
        <IconButton aria-label="Notifications" variant="ghost" size="sm" loading={isLoading}>
          <LuBell />
        </IconButton>

        {unreadNotificationsCount > 0 && (
          <Flex
            justifyContent="center"
            alignItems="center"
            position="absolute"
            top={-1}
            right={-1}
            minW="5"
            h="5"
            px="1"
            borderRadius="full"
            bg="brand.solid"
            color="brand.contrast"
            fontSize="2xs"
            fontWeight="semibold"
          >
            {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
          </Flex>
        )}
      </NavLink>
    </>
  );
};

export default NotificationButton;
