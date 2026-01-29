import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import { Box, Button, Card, HStack, Text } from '@chakra-ui/react';
import EmptyState from '@/components/info-states/empty-state';
import { Flex } from '@chakra-ui/react';
import { LuUserPlus } from 'react-icons/lu';
import useSearchUsers from './apis/use-search-users';
import SimpleAvatar from '@/components/simple-avatar';

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

                      <Button variant="subtle" colorPalette="blue" size="sm">
                        <LuUserPlus />
                        Add Friend
                      </Button>
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
