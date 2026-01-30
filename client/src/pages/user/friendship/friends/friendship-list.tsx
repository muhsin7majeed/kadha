import CommonSpinner from '@/components/spinners/common-spinner';
import useFriendships, { FriendshipType } from '../apis/use-friends';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import { Box, Button, Card, HStack, Text } from '@chakra-ui/react';
import SimpleAvatar from '@/components/simple-avatar';
import useUnfriend from '../apis/use-unfriend';
import useUnblock from '../apis/use-unblock';
import { LuUserMinus, LuShieldOff, LuCheck, LuX } from 'react-icons/lu';
import useAcceptFriendRequest from '../apis/use-accept-friend-request';
import useRejectFriendRequest from '../apis/use-reject-friend-request';

interface FriendshipListProps {
  type: FriendshipType;
  emptyTitle: string;
  emptyDescription: string;
}

const FriendshipList: React.FC<FriendshipListProps> = ({ type, emptyTitle, emptyDescription }) => {
  const { data: users, isLoading, error, refetch } = useFriendships(type);

  const { mutateAsync: unfriend, isPending: isUnfriending } = useUnfriend();
  const { mutateAsync: unblock, isPending: isUnblocking } = useUnblock();
  const { mutateAsync: acceptFriendRequest, isPending: isAcceptingFriendRequest } = useAcceptFriendRequest();
  const { mutateAsync: rejectFriendRequest, isPending: isRejectingFriendRequest } = useRejectFriendRequest();

  const handleAcceptFriendRequest = async (userId: string) => {
    await acceptFriendRequest(userId);
    refetch();
  };

  const handleRejectFriendRequest = async (userId: string) => {
    await rejectFriendRequest(userId);
    refetch();
  };

  const handleUnfriend = async (userId: string) => {
    await unfriend(userId);
    refetch();
  };

  const handleUnblock = async (userId: string) => {
    await unblock(userId);
    refetch();
  };

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
            <Box display="flex" alignItems="center" gap={3}>
              <SimpleAvatar fallbackName={user.username} />
              <Text fontWeight="medium">{user.username}</Text>
            </Box>

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
    </Box>
  );
};

export default FriendshipList;
