import PageHeader from '@/components/page-header';
import useNotifications from './apis/use-notifications';
import EmptyState from '@/components/info-states/empty-state';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { NotificationType } from '@/types/common';
import SimpleAvatar from '@/components/simple-avatar';
import { formatTimeAgo } from '@/lib/date-fns';

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
              {notification.type === NotificationType.FriendRequestReceived ? (
                <Flex
                  justifyContent="space-between"
                  alignItems="center"
                  gap={4}
                  border="1px solid"
                  borderColor="border.emphasized"
                  borderRadius="lg"
                  p={4}
                  my={2}
                >
                  <SimpleAvatar fallbackName={notification.actor?.username} />
                  <Box me="auto">
                    <Text fontSize="sm" color="GrayText" mb={1}>
                      {formatTimeAgo(notification.createdAt)}
                    </Text>
                    <Text>{notification.actor?.username} sent you a friend request</Text>
                  </Box>

                  <Button size="sm" colorPalette="green" variant="subtle">
                    Accept
                  </Button>
                  <Button size="sm" colorPalette="red" variant="subtle">
                    Reject
                  </Button>
                </Flex>
              ) : null}
            </Box>
          ))}
        </>
      )}
    </>
  );
};

export default Notifications;
