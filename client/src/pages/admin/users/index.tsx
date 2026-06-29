import { Box, Button, Card, HStack, NativeSelect, Stack, Table, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { LuEye, LuUsers } from 'react-icons/lu';
import { Link } from 'react-router';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import SearchInput from '@/components/search-input';
import CommonSpinner from '@/components/spinners/common-spinner';
import useAdminUsers from '@/features/admin/api/use-admin-users';
import { AdminRoleFilter, AdminSortOrder, AdminUserSort } from '@/features/admin/admin.types';
import { UserRole } from '@/types/common';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 20;

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const AdminUsers = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState<AdminRoleFilter>('ALL');
  const [sort, setSort] = useState<AdminUserSort>('createdAt');
  const [order, setOrder] = useState<AdminSortOrder>('desc');

  const { data, isLoading, isError, isFetching, refetch } = useAdminUsers({
    page,
    limit: PAGE_SIZE,
    query,
    role,
    sort,
    order,
  });
  const users = data?.data ?? [];

  const resetToFirstPage = () => {
    setPage(1);
  };

  return (
    <Box>
      <PageHeader isFetching={isFetching} subHeader="Search, filter, and inspect account summaries.">
        Admin Users
      </PageHeader>

      <Stack gap="4">
        <Stack direction={{ base: 'column', md: 'row' }} gap="3">
          <SearchInput
            placeholder="Search username"
            defaultValue={query}
            onSearchChange={(value) => {
              setQuery(value);
              resetToFirstPage();
            }}
          />

          <NativeSelect.Root maxW={{ base: 'full', md: '44' }}>
            <NativeSelect.Field
              aria-label="Filter by role"
              value={role}
              onChange={(event) => {
                setRole(event.target.value as AdminRoleFilter);
                resetToFirstPage();
              }}
            >
              <option value="ALL">All roles</option>
              <option value={UserRole.Admin}>Admins</option>
              <option value={UserRole.User}>Users</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <NativeSelect.Root maxW={{ base: 'full', md: '52' }}>
            <NativeSelect.Field
              aria-label="Sort users"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as AdminUserSort);
                resetToFirstPage();
              }}
            >
              <option value="createdAt">Joined date</option>
              <option value="updatedAt">Updated date</option>
              <option value="username">Username</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>

          <NativeSelect.Root maxW={{ base: 'full', md: '40' }}>
            <NativeSelect.Field
              aria-label="Sort order"
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as AdminSortOrder);
                resetToFirstPage();
              }}
            >
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Stack>

        {isLoading ? (
          <CommonSpinner />
        ) : isError ? (
          <ErrorState title="Error" description="Failed to fetch admin users" onRetry={refetch} />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search or role filter." icon={<LuUsers />} />
        ) : (
          <>
            <Card.Root>
              <Box overflowX="auto">
                <Table.Root size="sm" minW="1100px">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Username</Table.ColumnHeader>
                      <Table.ColumnHeader>Role</Table.ColumnHeader>
                      <Table.ColumnHeader>Joined</Table.ColumnHeader>
                      <Table.ColumnHeader>Updated</Table.ColumnHeader>
                      <Table.ColumnHeader>Profile</Table.ColumnHeader>
                      <Table.ColumnHeader>Watched</Table.ColumnHeader>
                      <Table.ColumnHeader>Liked</Table.ColumnHeader>
                      <Table.ColumnHeader>Watchlist</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Watched</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Liked</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Watchlist</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Collections</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Friends</Table.ColumnHeader>
                      <Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {users.map((user) => (
                      <Table.Row key={user.id}>
                        <Table.Cell fontWeight="medium">{user.username}</Table.Cell>
                        <Table.Cell>{formatEnumLabel(user.role)}</Table.Cell>
                        <Table.Cell>{formatDate(user.createdAt, 'DD MMM YYYY')}</Table.Cell>
                        <Table.Cell>{formatDate(user.updatedAt, 'DD MMM YYYY')}</Table.Cell>
                        <Table.Cell>{formatEnumLabel(user.profilePrivacy)}</Table.Cell>
                        <Table.Cell>{formatEnumLabel(user.watchedPrivacy)}</Table.Cell>
                        <Table.Cell>{formatEnumLabel(user.likedPrivacy)}</Table.Cell>
                        <Table.Cell>{formatEnumLabel(user.watchlistPrivacy)}</Table.Cell>
                        <Table.Cell textAlign="right">{user.watchedCount}</Table.Cell>
                        <Table.Cell textAlign="right">{user.likedCount}</Table.Cell>
                        <Table.Cell textAlign="right">{user.watchlistCount}</Table.Cell>
                        <Table.Cell textAlign="right">{user.collectionCount}</Table.Cell>
                        <Table.Cell textAlign="right">{user.friendCount}</Table.Cell>
                        <Table.Cell textAlign="right">
                          <Button asChild size="xs" variant="outline">
                            <Link to={`/app/admin/users/${user.id}`}>
                              <LuEye />
                              View
                            </Link>
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Card.Root>

            <HStack justifyContent="space-between" flexWrap="wrap" gap="3">
              <Text color="fg.muted" fontSize="sm">
                {data?.pagination.total ?? 0} total users
              </Text>
              <PaginationControls pagination={data?.pagination} onPageChange={setPage} isDisabled={isFetching} />
            </HStack>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default AdminUsers;
