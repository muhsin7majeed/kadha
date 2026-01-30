import CommonSpinner from '@/components/spinners/common-spinner';
import useFriendships, { FriendshipType } from '../apis/use-friends';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import { Box, Card, Text } from '@chakra-ui/react';
import SimpleAvatar from '@/components/simple-avatar';

interface FriendshipListProps {
  type: FriendshipType;
  emptyTitle: string;
  emptyDescription: string;
}

const FriendshipList: React.FC<FriendshipListProps> = ({ type, emptyTitle, emptyDescription }) => {
  const { data: users, isLoading, error, refetch } = useFriendships(type);

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
          <Box display="flex" alignItems="center" gap={3}>
            <SimpleAvatar fallbackName={user.username} />
            <Text fontWeight="medium">{user.username}</Text>
          </Box>
        </Card.Root>
      ))}
    </Box>
  );
};

export default FriendshipList;
