import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import { Box, Button, Card, HStack, Text } from '@chakra-ui/react';
import EmptyState from '@/components/info-states/empty-state';
import { Flex } from '@chakra-ui/react';
import { LuCheck, LuClock, LuUserCheck, LuUserPlus, LuX } from 'react-icons/lu';
import useSearchUsers from './apis/use-search-users';
import SimpleAvatar from '@/components/simple-avatar';
import useSendFriendRequest from '@/pages/user/friendship/apis/use-send-friend-request';
import useAcceptFriendRequest from '@/pages/user/friendship/apis/use-accept-friend-request';
import useRejectFriendRequest from '@/pages/user/friendship/apis/use-reject-friend-request';
import { FriendStatus } from '@/types/common';
import { UserSearchResult } from '@/types/user';

interface UsersSearchResultProps {
  searchQuery: string;
}

const UsersSearchResult: React.FC<UsersSearchResultProps> = ({ searchQuery }) => {
  const {
    data: users,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    error: errorUsers,
    refetch: refetchUsers,
  } = useSearchUsers(searchQuery);

  const { mutateAsync: sendFriendRequest, isPending: isSendingFriendRequest } = useSendFriendRequest();
  const { mutateAsync: acceptFriendRequest, isPending: isAcceptingFriendRequest } = useAcceptFriendRequest();
  const { mutateAsync: rejectFriendRequest, isPending: isRejectingFriendRequest } = useRejectFriendRequest();

  const handleSendFriendRequest = async (userId: string) => {
    if (isSendingFriendRequest) return;
    await sendFriendRequest(userId);
    refetchUsers();
  };

  const handleAcceptFriendRequest = async (senderId: string) => {
    if (isAcceptingFriendRequest) return;
    await acceptFriendRequest(senderId);
    refetchUsers();
  };

  const handleRejectFriendRequest = async (senderId: string) => {
    if (isRejectingFriendRequest) return;
    await rejectFriendRequest(senderId);
    refetchUsers();
  };

  const renderFriendshipActions = (user: UserSearchResult) => {
    const { friendshipStatus, isRequestSender } = user;

    // Already friends
    if (friendshipStatus === FriendStatus.Accepted) {
      return (
        <Button variant="subtle" colorPalette="green" size="sm" disabled>
          <LuUserCheck />
          Friends
        </Button>
      );
    }

    // Current user sent a pending request
    if (friendshipStatus === FriendStatus.Pending && isRequestSender) {
      return (
        <Button variant="subtle" colorPalette="gray" size="sm" disabled>
          <LuClock />
          Request Sent
        </Button>
      );
    }

    // Other user sent a pending request - show Accept/Reject
    if (friendshipStatus === FriendStatus.Pending && !isRequestSender) {
      return (
        <HStack gap="2">
          <Button
            variant="subtle"
            colorPalette="green"
            size="sm"
            loading={isAcceptingFriendRequest}
            onClick={() => handleAcceptFriendRequest(user.id)}
          >
            <LuCheck />
            Accept
          </Button>
          <Button
            variant="subtle"
            colorPalette="red"
            size="sm"
            loading={isRejectingFriendRequest}
            onClick={() => handleRejectFriendRequest(user.id)}
          >
            <LuX />
            Reject
          </Button>
        </HStack>
      );
    }

    // No relationship - show Add Friend
    return (
      <Button
        variant="subtle"
        colorPalette="blue"
        size="sm"
        loading={isSendingFriendRequest}
        onClick={() => handleSendFriendRequest(user.id)}
      >
        <LuUserPlus />
        Add Friend
      </Button>
    );
  };

  return (
    <>
      <PageHeader isFetching={isFetchingUsers} subHeader={`Found ${users?.length} results for "${searchQuery}"`}>
        Users
      </PageHeader>

      {isLoadingUsers ? (
        <CommonSpinner />
      ) : errorUsers ? (
        <ErrorState title="Error" description="Error loading users" onRetry={refetchUsers} />
      ) : !users || users?.length === 0 ? (
        <EmptyState title="No users found" description="Try searching for a different user." />
      ) : (
        <Box>
          {users?.map((user) => {
            return (
              <Card.Root key={user.id}>
                <Card.Body>
                  <HStack gap="3">
                    <SimpleAvatar fallbackName={user.username} />

                    <Flex justifyContent="space-between" alignItems="center" width="100%">
                      <Text fontWeight="semibold" textStyle="sm">
                        @{user.username}
                      </Text>

                      {renderFriendshipActions(user)}
                    </Flex>
                  </HStack>
                </Card.Body>
              </Card.Root>
            );
          })}
        </Box>
      )}
    </>
  );
};

export default UsersSearchResult;
