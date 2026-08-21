import PageHeader from '@/components/page-header';
import useNotifications from '@/features/notifications/api/use-notifications';
import EmptyState from '@/components/info-states/empty-state';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { Box, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { Notification, NotificationType } from '@/features/notifications/notifications.types';
import { formatTimeAgo } from '@/utils/date';
import FriendshipActions from '@/features/friendship/components/friendship-actions';
import UserLink from '@/components/user-link';
import useMarkNotificationRead from '@/features/notifications/api/use-mark-notification-read';
import useMarkAllNotificationsRead from '@/features/notifications/api/use-mark-all-notifications-read';
import PaginationControls from '@/components/pagination-controls';
import { useState } from 'react';
import useRespondToCollectionInvite from '@/features/collections/api/use-respond-to-collection-invite';
import {
  parseCollectionInviteMetadata,
  parseSystemNotificationMetadata,
} from '@/features/notifications/utils/notification-metadata';
import CollectionDetailsDialog from '@/features/collections/components/collection-details-dialog';
import { useQueryClient } from '@tanstack/react-query';
import { invalidateCollection, invalidateCollections } from '@/features/collections/api/invalidate-collection-queries';

interface SelectedCollection {
  id: string;
  name: string;
}

const getNotificationMessage = (notification: Notification) => {
  switch (notification.type) {
    case NotificationType.FriendRequestReceived:
      return 'Sent you a friend request';
    case NotificationType.FriendRequestAccepted:
      return 'Accepted your friend request';
    case NotificationType.CollectionInvite: {
      const metadata = parseCollectionInviteMetadata(notification.metadata);
      const action = metadata.role === 'editor' ? 'collaborate on' : 'view';
      return metadata.collectionName
        ? `Invited you to ${action} ${metadata.collectionName}`
        : 'Invited you to a collection';
    }
    default:
      return 'Sent you a notification';
  }
};

const Notifications = () => {
  const [page, setPage] = useState(1);
  const [selectedCollection, setSelectedCollection] = useState<SelectedCollection | null>(null);
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useNotifications(page);
  const markNotificationRead = useMarkNotificationRead();
  const markAllNotificationsRead = useMarkAllNotificationsRead();
  const respondToCollectionInvite = useRespondToCollectionInvite();
  const notifications = data?.data ?? [];
  const hasUnreadNotifications = notifications.some((notification) => !notification.read);

  const renderMessage = (notification: Notification) => {
    const metadata = parseSystemNotificationMetadata(notification.metadata);
    const collectionButton =
      notification.entityId && metadata.collectionName ? (
        <Button
          variant="plain"
          colorPalette="brand"
          h="auto"
          minW="0"
          p="0"
          verticalAlign="baseline"
          textDecoration="underline"
          onClick={() => {
            void invalidateCollection(queryClient, notification.entityId!);
            void invalidateCollections(queryClient);
            setSelectedCollection({ id: notification.entityId!, name: metadata.collectionName! });
            if (!notification.read) markNotificationRead.mutate(notification.id);
          }}
        >
          “{metadata.collectionName}”
        </Button>
      ) : null;

    switch (notification.type) {
      case NotificationType.CollectionOwnershipReceived:
        return collectionButton ? (
          <>You now own {collectionButton} because its previous owner is no longer available.</>
        ) : (
          'You now own a collection because its previous owner is no longer available.'
        );
      case NotificationType.CollectionOwnershipChanged:
        return collectionButton ? <>{collectionButton} has a new owner.</> : 'A shared collection has a new owner.';
      case NotificationType.SharedCollectionsRemoved:
        return metadata.count === 1
          ? 'A shared collection is no longer available because its owner deleted their account.'
          : `${metadata.count} shared collections are no longer available because their owner deleted their account.`;
      case NotificationType.CollectionCollaboratorDeparted:
        return metadata.count === 1
          ? 'A collaborator is no longer available and was removed from your collection.'
          : `A collaborator is no longer available and was removed from ${metadata.count} of your collections.`;
      default:
        return getNotificationMessage(notification);
    }
  };

  return (
    <>
      <PageHeader isFetching={isFetching} mb="4">
        Notifications
      </PageHeader>

      <HStack justifyContent="flex-end" mb="4">
        <Button
          size="sm"
          variant="outline"
          colorPalette="gray"
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
                borderColor={notification.read ? 'border.subtle' : 'brand.muted'}
                borderRadius="lg"
                bg={notification.read ? 'transparent' : 'brand.subtle'}
                p={4}
                direction={{ base: 'column', md: 'row' }}
              >
                <Box flex="1" minW="0">
                  <Text textStyle="supporting" color="GrayText" mb={1}>
                    {formatTimeAgo(notification.createdAt)}
                  </Text>

                  {notification.actor?.username && <UserLink username={notification.actor?.username} />}

                  <Text as="div" my="2">
                    {renderMessage(notification)}
                  </Text>
                </Box>

                <HStack gap="2" alignSelf={{ base: 'stretch', md: 'center' }} justifyContent="flex-end" flexWrap="wrap">
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      colorPalette="gray"
                      loading={markNotificationRead.isPending}
                      onClick={() => markNotificationRead.mutate(notification.id)}
                    >
                      Mark read
                    </Button>
                  )}

                  {notification.type === NotificationType.CollectionInvite && notification.entityId && (
                    <>
                      <Button
                        size="sm"
                        colorPalette="brand"
                        loading={respondToCollectionInvite.isPending}
                        onClick={() =>
                          respondToCollectionInvite.mutate({
                            inviteId: notification.entityId!,
                            action: 'accept',
                          })
                        }
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        colorPalette="red"
                        loading={respondToCollectionInvite.isPending}
                        onClick={() =>
                          respondToCollectionInvite.mutate({
                            inviteId: notification.entityId!,
                            action: 'reject',
                          })
                        }
                      >
                        Reject
                      </Button>
                    </>
                  )}

                  {notification.actor && notification.type !== NotificationType.CollectionInvite && (
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

      {selectedCollection && (
        <CollectionDetailsDialog
          collectionId={selectedCollection.id}
          collectionName={selectedCollection.name}
          open
          onClose={() => setSelectedCollection(null)}
        />
      )}
    </>
  );
};

export default Notifications;
