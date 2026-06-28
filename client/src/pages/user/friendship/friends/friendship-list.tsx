import CommonSpinner from '@/components/spinners/common-spinner';
import useFriendships from '@/features/friendship/api/use-friends';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import { Box, Button, Card, HStack } from '@chakra-ui/react';
import useUnfriend from '@/features/friendship/api/use-unfriend';
import useUnblock from '@/features/friendship/api/use-unblock';
import { LuUserMinus, LuShieldOff, LuCheck, LuX } from 'react-icons/lu';
import useAcceptFriendRequest from '@/features/friendship/api/use-accept-friend-request';
import useRejectFriendRequest from '@/features/friendship/api/use-reject-friend-request';
import UserLink from '@/components/user-link';
import { FriendshipType } from '@/features/friendship/friendship.types';
import PaginationControls from '@/components/pagination-controls';
import { useEffect, useState } from 'react';

interface FriendshipListProps {
  type: FriendshipType;
  emptyTitle: string;
  emptyDescription: string;
}

const FriendshipList: React.FC<FriendshipListProps> = ({ type, emptyTitle, emptyDescription }) => {
  const [page, setPage] = useState(1);
  const { data: usersResponse, isLoading, isFetching, error, refetch } = useFriendships(type, page);
  const users = usersResponse?.data;

  const { mutateAsync: unfriend, isPending: isUnfriending } = useUnfriend();
  const { mutateAsync: unblock, isPending: isUnblocking } = useUnblock();
  const { mutateAsync: acceptFriendRequest, isPending: isAcceptingFriendRequest } = useAcceptFriendRequest();
  const { mutateAsync: rejectFriendRequest, isPending: isRejectingFriendRequest } = useRejectFriendRequest();

  const handleAcceptFriendRequest = async (userId: string) => {
    await acceptFriendRequest(userId);
  };

  const handleRejectFriendRequest = async (userId: string) => {
    await rejectFriendRequest(userId);
  };

  const handleUnfriend = async (userId: string) => {
    await unfriend(userId);
  };

  const handleUnblock = async (userId: string) => {
    await unblock(userId);
  };

  useEffect(() => {
    setPage(1);
  }, [type]);

  if (isLoading) {
    return <CommonSpinner />;
  }

  if (error) {
    return <ErrorState title="Error" description="Failed to fetch data" onRetry={refetch} />;
  }

  if (!users?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {users.map((user) => (
        <Card.Root key={user.id} p={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={3}>
            <UserLink username={user.username} />

            {type === 'received' && (
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
            )}

            {type === 'friends' && (
              <Button
                variant="subtle"
                colorPalette="red"
                size="sm"
                loading={isUnfriending}
                onClick={() => handleUnfriend(user.id)}
              >
                <LuUserMinus />
                Unfriend
              </Button>
            )}

            {type === 'blocked' && (
              <Button
                variant="subtle"
                colorPalette="blue"
                size="sm"
                loading={isUnblocking}
                onClick={() => handleUnblock(user.id)}
              >
                <LuShieldOff />
                Unblock
              </Button>
            )}
          </Box>
        </Card.Root>
      ))}
      <PaginationControls pagination={usersResponse?.pagination} isDisabled={isFetching} onPageChange={setPage} />
    </Box>
  );
};

export default FriendshipList;
