import { Badge, Box, Button, Card, HStack, NativeSelect, Stack, Table, Text } from '@chakra-ui/react';
import { useRef, useState } from 'react';
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
  const resultsRef = useRef<HTMLDivElement>(null);

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
      <PageHeader isFetching={isFetching} subHeader="Find accounts and manage administrator access.">
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
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Stack>

        {isLoading ? (
          <CommonSpinner />
        ) : isError ? (
          <ErrorState title="Users unavailable" description="Failed to fetch admin users." onRetry={refetch} />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Try a different search or role filter." icon={<LuUsers />} />
        ) : (
          <>
            <Card.Root ref={resultsRef}>
              <Table.Root size="sm" tableLayout="fixed">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader width={{ base: 'auto', md: '45%' }}>Username</Table.ColumnHeader>
                    <Table.ColumnHeader width={{ base: '28', md: 'auto' }}>Role</Table.ColumnHeader>
                    <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>Joined</Table.ColumnHeader>
                    <Table.ColumnHeader width={{ base: '14', md: '24' }} textAlign="right">
                      Action
                    </Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {users.map((user) => (
                    <Table.Row key={user.id}>
                      <Table.Cell minW="0">
                        <Text fontWeight="medium" overflowWrap="anywhere">
                          {user.username}
                        </Text>
                        <Text display={{ base: 'block', md: 'none' }} color="fg.muted" textStyle="supporting">
                          Joined {formatDate(user.createdAt, 'DD MMM YYYY')}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge colorPalette={user.role === UserRole.Admin ? 'brand' : 'gray'}>
                          {formatEnumLabel(user.role)}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                        {formatDate(user.createdAt, 'DD MMM YYYY')}
                      </Table.Cell>
                      <Table.Cell textAlign="right">
                        <Button
                          asChild
                          size="xs"
                          variant="outline"
                          colorPalette="gray"
                          aria-label={`View ${user.username}`}
                        >
                          <Link to={`/app/admin/users/${user.id}`}>
                            <LuEye aria-hidden />
                            <Text as="span" display={{ base: 'none', md: 'inline' }}>
                              View
                            </Text>
                          </Link>
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Root>

            <HStack justifyContent="space-between" flexWrap="wrap" gap="3">
              <Text color="fg.muted" textStyle="supporting">
                {data?.pagination.total ?? 0} total users
              </Text>
              <PaginationControls
                pagination={data?.pagination}
                onPageChange={setPage}
                isDisabled={isFetching}
                scrollTargetRef={resultsRef}
              />
            </HStack>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default AdminUsers;
