import { Box, Card, HStack, Text, VStack } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import NavLink from '@/components/nav-link';
import PaginationControls from '@/components/pagination-controls';
import SimpleAvatar from '@/components/simple-avatar';
import { SearchTab } from '@/features/search/search.types';
import useSearchUsers from '@/features/user/api/use-search-users';
import FriendshipActions from '@/pages/user/friendship/friendship-actions';
import SearchLoadingState from '@/features/search/components/search-loading-state';

interface UserSearchResultsProps {
  activeTab: SearchTab;
  query: string;
  page: number;
  open: boolean;
  onClose: () => void;
  onPageChange: (page: number) => void;
}

const UserSearchResults = ({ activeTab, query, page, open, onClose, onPageChange }: UserSearchResultsProps) => {
  const enabled = open && activeTab === 'users' && query.length >= 2;
  const { data, isLoading, isFetching, error, refetch } = useSearchUsers(query, page, enabled);
  const users = data?.data;

  if (!enabled) {
    return null;
  }

  if (isLoading) {
    return <SearchLoadingState />;
  }

  if (error) {
    return <ErrorState title="Error" description="Failed to fetch users" onRetry={refetch} />;
  }

  if (!users || users.length === 0) {
    return <EmptyState title="No users found" description="Try a different search." icon={<LuSearch />} />;
  }

  return (
    <Box>
      <Text color="fg.muted" fontSize="sm" mb={4}>
        {data.pagination.total} results
      </Text>

      <VStack align="stretch" gap={3}>
        {users.map((user) => (
          <Card.Root key={user.id}>
            <Card.Body>
              <HStack justify="space-between" gap={4}>
                <NavLink
                  to={`/app/profile/${user.username}`}
                  display="flex"
                  alignItems="center"
                  gap={3}
                  onClick={onClose}
                >
                  <SimpleAvatar fallbackName={user.username} />
                  <Text fontWeight="medium">{user.username}</Text>
                </NavLink>

                <FriendshipActions
                  user={{
                    id: user.id,
                    friendshipStatus: user.friendshipStatus,
                    isRequestSender: user.isRequestSender,
                  }}
                />
              </HStack>
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>

      <PaginationControls pagination={data.pagination} isDisabled={isFetching} onPageChange={onPageChange} />
    </Box>
  );
};

export default UserSearchResults;
