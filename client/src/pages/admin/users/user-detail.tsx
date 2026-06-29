import { Badge, Box, Button, Card, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { LuArrowLeft, LuUser } from 'react-icons/lu';
import { Link, useParams } from 'react-router';

import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useAdminUser from '@/features/admin/api/use-admin-user';
import { formatDate } from '@/utils/date';

interface DetailItemProps {
  label: string;
  value: string | number;
}

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const DetailItem = ({ label, value }: DetailItemProps) => (
  <Box>
    <Text color="fg.muted" fontSize="sm">
      {label}
    </Text>
    <Text fontWeight="medium" overflowWrap="anywhere">
      {value}
    </Text>
  </Box>
);

const AdminUserDetail = () => {
  const { id } = useParams();
  const { data: user, isLoading, isError, isFetching, refetch } = useAdminUser(id);

  return (
    <Box>
      <PageHeader isFetching={isFetching} subHeader="Read-only account summary and aggregate counts.">
        User Detail
      </PageHeader>

      <Button asChild variant="ghost" size="sm" mb="4">
        <Link to="/app/admin/users">
          <LuArrowLeft />
          Users
        </Link>
      </Button>

      {isLoading ? (
        <CommonSpinner />
      ) : isError || !user ? (
        <ErrorState title="Error" description="Failed to fetch user details" onRetry={refetch} />
      ) : (
        <Stack gap="4">
          <Card.Root>
            <Card.Body>
              <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" gap="4">
                <Box minW="0">
                  <Text fontSize="2xl" fontWeight="semibold" overflowWrap="anywhere">
                    {user.username}
                  </Text>
                  <Text color="fg.muted" fontSize="sm" overflowWrap="anywhere">
                    {user.id}
                  </Text>
                </Box>
                <Badge alignSelf={{ base: 'flex-start', md: 'center' }} colorPalette="orange" variant="subtle">
                  <LuUser />
                  {formatEnumLabel(user.role)}
                </Badge>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Account</Text>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <DetailItem label="Created" value={formatDate(user.createdAt, 'DD MMM YYYY, HH:mm')} />
                <DetailItem label="Updated" value={formatDate(user.updatedAt, 'DD MMM YYYY, HH:mm')} />
                <DetailItem label="Profile privacy" value={formatEnumLabel(user.profilePrivacy)} />
                <DetailItem label="Watched privacy" value={formatEnumLabel(user.watchedPrivacy)} />
                <DetailItem label="Liked privacy" value={formatEnumLabel(user.likedPrivacy)} />
                <DetailItem label="Watchlist privacy" value={formatEnumLabel(user.watchlistPrivacy)} />
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Usage Counts</Text>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} gap="4">
                <DetailItem label="Watched" value={user.watchedCount} />
                <DetailItem label="Liked" value={user.likedCount} />
                <DetailItem label="Watchlist" value={user.watchlistCount} />
                <DetailItem label="Collections" value={user.collectionCount} />
                <DetailItem label="Friends" value={user.friendCount} />
              </SimpleGrid>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Friend Requests</Text>
            </Card.Header>
            <Card.Body>
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
                <DetailItem label="Pending sent" value={user.pendingSentFriendRequestCount} />
                <DetailItem label="Pending received" value={user.pendingReceivedFriendRequestCount} />
              </SimpleGrid>
            </Card.Body>
          </Card.Root>
        </Stack>
      )}
    </Box>
  );
};

export default AdminUserDetail;
