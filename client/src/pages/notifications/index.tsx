import PageHeader from '@/components/page-header';
import useNotifications from '@/features/notifications/api/use-notifications';
import EmptyState from '@/components/info-states/empty-state';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { Notification, NotificationType } from '@/features/notifications/notifications.types';
import { formatTimeAgo } from '@/utils/date';
import FriendshipActions from '../user/friendship/friendship-actions';
import UserLink from '@/components/user-link';
import useMarkNotificationRead from '@/features/notifications/api/use-mark-notification-read';
import useMarkAllNotificationsRead from '@/features/notifications/api/use-mark-all-notifications-read';
import PaginationControls from '@/components/pagination-controls';
import { useState } from 'react';

const getNotificationMessage = (notification: Notification) => {
  switch (notification.type) {
    case NotificationType.FriendRequestReceived:
      return 'Sent you a friend request';
    case NotificationType.FriendRequestAccepted:
      return 'Accepted your friend request';
    default:
      return 'Sent you a notification';
  }
};

const Notifications = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, isFetching, refetch } = useNotifications(page);
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const notifications = data?.data ?? [];
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);

  return (
    <>
      <PageHeader isFetching={isFetching} mb="4">
        Notifications
      </PageHeader>

      <HStack justifyContent="flex-end" mb="4">
        <Button
          size="sm"
          variant="outline"
          disabled={!hasUnreadNotifications}
          loading={markAllNotificationsRead.isPending}
          onClick={() => markAllNotificationsRead.mutate()}
        >
          Mark all as read
        </Button>
      </HStack>

      {isLoading ? (
        <CommonSpinner />
      ) : isError ? (
        <ErrorState title="Error" description="Failed to fetch notifications" onRetry={refetch} />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" description="No notifications found" />
      ) : (
        <Stack gap="2">
          {notifications.map((notification) => (
            <Box as="article" key={notification.id}>
              <Flex
                justifyContent="space-between"
                alignItems={{ base: 'flex-start', md: 'center' }}
                gap={4}
                border="1px solid"
                borderColor={notification.read ? 'border.subtle' : 'orange.muted'}
                borderRadius="lg"
                bg={notification.read ? 'transparent' : 'orange.subtle'}
                p={4}
                direction={{ base: 'column', md: 'row' }}
              >
                <Box flex="1" minW="0">
                  <Text fontSize="sm" color="GrayText" mb={1}>
                    {formatTimeAgo(notification.createdAt)}
                  </Text>

                  {notification.actor?.username && <UserLink username={notification.actor?.username} />}

                  <Text my="2">{getNotificationMessage(notification)}</Text>
                </Box>

                <HStack gap="2" alignSelf={{ base: 'stretch', md: 'center' }} justifyContent="flex-end" flexWrap="wrap">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={markNotificationRead.isPending}
                      onClick={() => markNotificationRead.mutate(notification.id)}
                    >
                      Mark read
                    </Button>
                  )}

                  {notification.actor && (
                    <FriendshipActions
                      user={{
                        id: notification.actor.id,
                        friendshipStatus: notification.actor.friendshipStatus!,
                        isRequestSender: notification.actor.isRequestSender!,
                      }}
                    />
                  )}
                </HStack>
              </Flex>
            </Box>
          ))}

          <PaginationControls pagination={data?.pagination} onPageChange={setPage} isDisabled={isFetching} />
        </Stack>
      )}
    </>
  );
};

export default Notifications;
