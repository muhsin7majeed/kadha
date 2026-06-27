import PageHeader from '@/components/page-header';
import useNotifications from '@/features/notifications/api/use-notifications';
import EmptyState from '@/components/info-states/empty-state';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { Box, Flex, Text } from '@chakra-ui/react';
import { NotificationType } from '@/types/common';
import { formatTimeAgo } from '@/utils/date';
import FriendshipActions from '../user/friendship/friendship-actions';
import UserLink from '@/components/user-link';

const Notifications = () => {
  const { data, isLoading, isError, isFetching, refetch } = useNotifications();

  return (
    <>
      <PageHeader isFetching={isFetching} mb="4">
        Notifications
      </PageHeader>

      {isLoading ? (
        <CommonSpinner />
      ) : isError ? (
        <ErrorState title="Error" description="Failed to fetch notifications" onRetry={refetch} />
      ) : data?.length === 0 ? (
        <EmptyState title="No notifications" description="No notifications found" />
      ) : (
        <>
          {data?.map((notification) => (
            <Box key={notification.id}>
              <Flex
                justifyContent="space-between"
                alignItems="center"
                gap={4}
                border="1px solid"
                borderColor="border.emphasized"
                borderRadius="lg"
                p={4}
                my={2}
                flexWrap={'wrap'}
              >
                <Box me="auto">
                  <Text fontSize="sm" color="GrayText" mb={1}>
                    {formatTimeAgo(notification.createdAt)}
                  </Text>

                  {notification.actor?.username && <UserLink username={notification.actor?.username} />}

                  <Text my="2">
                    {notification.type === NotificationType.FriendRequestReceived
                      ? `Sent you a friend request`
                      : `Accepted your friend request`}
                  </Text>
                </Box>

                {notification.actor && (
                  <Box ms="auto">
                    <FriendshipActions
                      user={{
                        id: notification.actor.id,
                        friendshipStatus: notification.actor.friendshipStatus!,
                        isRequestSender: notification.actor.isRequestSender!,
                      }}
                    />
                  </Box>
                )}
              </Flex>
            </Box>
          ))}
        </>
      )}
    </>
  );
};

export default Notifications;
