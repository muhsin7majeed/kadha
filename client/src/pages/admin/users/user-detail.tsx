import { Badge, Box, Button, Card, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuArrowLeft, LuUser } from 'react-icons/lu';
import { Link, useParams } from 'react-router';

import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import { APP_CONFIG } from '@/config/app-config';
import useUpdateAdminUserRole from '@/features/admin/api/use-update-admin-user-role';
import { useAuth } from '@/features/auth/use-auth';
import { UserRole } from '@/types/common';

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
    <Text color="fg.muted" textStyle="supporting">
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
  const auth = useAuth();
  const updateRole = useUpdateAdminUserRole();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const isSelf = user?.id === auth.user?.id;
  const nextRole = user?.role === UserRole.Admin ? UserRole.User : UserRole.Admin;
  const roleActionLabel = nextRole === UserRole.Admin ? 'Make admin' : 'Remove admin access';

  const handleRoleChange = () => {
    if (!user) return;

    updateRole.mutate(
      { id: user.id, role: nextRole },
      { onSuccess: () => setIsRoleDialogOpen(false) },
    );
  };

  return (
    <Box>
      <PageHeader isFetching={isFetching} subHeader="Inspect account summaries and manage global access roles.">
        User Detail
      </PageHeader>

      <Button asChild variant="ghost" colorPalette="gray" size="sm" mb="4">
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
                  <Text textStyle="pageTitle" overflowWrap="anywhere">
                    {user.username}
                  </Text>
                  <Text color="fg.muted" textStyle="supporting" overflowWrap="anywhere">
                    {user.id}
                  </Text>
                </Box>
                <Badge alignSelf={{ base: 'flex-start', md: 'center' }} colorPalette="brand" variant="subtle">
                  <LuUser />
                  {formatEnumLabel(user.role)}
                </Badge>
              </Stack>
            </Card.Body>
          </Card.Root>

          <Card.Root>
            <Card.Header>
              <Text fontWeight="semibold">Role management</Text>
            </Card.Header>
            <Card.Body gap="3">
              <Text color="fg.muted" textStyle="supporting">
                Change this account's global access level. The user keeps their existing account and data.
              </Text>
              {isSelf ? (
                <Text color="fg.muted" textStyle="supporting">
                  You cannot change your own role.
                </Text>
              ) : (
                <Button
                  alignSelf="flex-start"
                  colorPalette={nextRole === UserRole.Admin ? 'brand' : 'red'}
                  variant={nextRole === UserRole.Admin ? 'solid' : 'outline'}
                  onClick={() => setIsRoleDialogOpen(true)}
                >
                  {roleActionLabel}
                </Button>
              )}
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

          <ConfirmationDialog
            isOpen={isRoleDialogOpen}
            onOpenChange={setIsRoleDialogOpen}
            onConfirm={handleRoleChange}
            title={`${roleActionLabel} for ${user.username}?`}
            description={
              nextRole === UserRole.Admin
                ? `This gives the user access to the entire ${APP_CONFIG.appName} admin panel.`
                : `This removes the user’s access to the ${APP_CONFIG.appName} admin panel.`
            }
            confirmButtonText={roleActionLabel}
            confirmButtonProps={{
              colorPalette: nextRole === UserRole.Admin ? 'brand' : 'red',
              loading: updateRole.isPending,
            }}
          />
        </Stack>
      )}
    </Box>
  );
};

export default AdminUserDetail;
