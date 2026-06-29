import { Badge, Box, Button, Card, HStack, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { LuUsers } from 'react-icons/lu';
import { Link } from 'react-router';

import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useAdminOverview from '@/features/admin/api/use-admin-overview';

interface MetricCardProps {
  label: string;
  value: string | number;
}

const MetricCard = ({ label, value }: MetricCardProps) => (
  <Card.Root>
    <Card.Body gap="2">
      <Text color="fg.muted" fontSize="sm">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="semibold">
        {value}
      </Text>
    </Card.Body>
  </Card.Root>
);

const AdminOverview = () => {
  const { data, isLoading, isError, isFetching, refetch } = useAdminOverview();

  return (
    <Box>
      <PageHeader isFetching={isFetching} subHeader="Read-only instance metrics and account summaries.">
        Admin
      </PageHeader>

      {isLoading ? (
        <CommonSpinner />
      ) : isError || !data ? (
        <ErrorState title="Error" description="Failed to fetch admin overview" onRetry={refetch} />
      ) : (
        <Stack gap="6">
          <Card.Root>
            <Card.Body>
              <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" gap="4">
                <Box>
                  <HStack gap="2" mb="2" flexWrap="wrap">
                    <Badge colorPalette="orange" variant="subtle">
                      {data.appName}
                    </Badge>
                    <Badge variant="subtle">v{data.appVersion}</Badge>
                  </HStack>
                  <Text color="fg.muted" fontSize="sm">
                    Instance-level usage and account metrics.
                  </Text>
                </Box>

                <Button asChild colorPalette="orange" alignSelf={{ base: 'stretch', md: 'center' }}>
                  <Link to="/app/admin/users">
                    <LuUsers />
                    Users
                  </Link>
                </Button>
              </Stack>
            </Card.Body>
          </Card.Root>

          <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="4">
            <MetricCard label="Total users" value={data.totalUsers} />
            <MetricCard label="New users, 7 days" value={data.newUsersLast7Days} />
            <MetricCard label="New users, 30 days" value={data.newUsersLast30Days} />
            <MetricCard label="Admins" value={data.totalAdmins} />
            <MetricCard label="Tracked media rows" value={data.totalTrackedMediaRows} />
            <MetricCard label="Collections" value={data.totalCollections} />
            <MetricCard label="Friendships" value={data.totalFriendships} />
            <MetricCard label="Notifications" value={data.totalNotifications} />
          </SimpleGrid>
        </Stack>
      )}
    </Box>
  );
};

export default AdminOverview;
