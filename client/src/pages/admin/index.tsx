import { Chart, useChart } from '@chakra-ui/charts';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  HStack,
  Link as ChakraLink,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  VisuallyHidden,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { LuActivity, LuArrowRight, LuMessageSquare, LuRefreshCw, LuServer, LuUsers } from 'react-icons/lu';
import { Link } from 'react-router';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import useAdminOverview from '@/features/admin/api/use-admin-overview';
import type { AdminOverview, AdminOverviewTrendPoint } from '@/features/admin/admin.types';
import { formatDate, formatTimeAgo } from '@/utils/date';

interface MetricCardProps {
  label: string;
  value: number;
  detail: string;
}

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);
const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const MetricCard = ({ label, value, detail }: MetricCardProps) => (
  <Card.Root>
    <Card.Body gap="1">
      <Text color="fg.muted" textStyle="supporting">
        {label}
      </Text>
      <Text fontSize="2xl" fontWeight="semibold">
        {formatNumber(value)}
      </Text>
      <Text color="fg.muted" textStyle="supporting">
        {detail}
      </Text>
    </Card.Body>
  </Card.Root>
);

const CompactMetric = ({ label, value, detail }: MetricCardProps) => (
  <Box>
    <Text color="fg.muted" textStyle="supporting">
      {label}
    </Text>
    <Text fontSize="xl" fontWeight="semibold">
      {formatNumber(value)}
    </Text>
    <Text color="fg.muted" textStyle="supporting">
      {detail}
    </Text>
  </Box>
);

const OverviewSkeleton = () => (
  <Stack gap="6" role="status" aria-label="Loading admin overview">
    <Skeleton height="28" />
    <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} height="28" />
      ))}
    </SimpleGrid>
    <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) minmax(0, 1.35fr)' }} gap="6">
      <Skeleton height="72" />
      <Skeleton height="72" />
    </Grid>
  </Stack>
);

const FeedbackAttention = ({ feedback }: Pick<AdminOverview, 'feedback'>) => (
  <Card.Root height="full">
    <Card.Header>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="start" gap="4">
        <Box>
          <HStack gap="2">
            <LuMessageSquare aria-hidden />
            <Text textStyle="sectionTitle">Needs attention</Text>
          </HStack>
          <Text color="fg.muted" textStyle="supporting" mt="1">
            {formatNumber(feedback.newCount)} new · {formatNumber(feedback.openCount)} open
          </Text>
        </Box>
        <Button asChild variant="outline" colorPalette="gray" size="sm">
          <Link to="/app/admin/feedback">
            All feedback
            <LuArrowRight aria-hidden />
          </Link>
        </Button>
      </Flex>
    </Card.Header>
    <Card.Body pt="0">
      {feedback.recentOpen.length === 0 ? (
        <Stack align="center" justify="center" textAlign="center" minH="44" gap="2">
          <Text fontWeight="medium">No feedback needs attention.</Text>
          <Text color="fg.muted" textStyle="supporting">
            New and acknowledged feedback will appear here.
          </Text>
        </Stack>
      ) : (
        <Stack gap="1">
          {feedback.recentOpen.map((item) => (
            <ChakraLink
              key={item.id}
              asChild
              p="3"
              rounded="md"
              color="fg"
              textDecoration="none"
              _hover={{ bg: 'bg.subtle' }}
              _focusVisible={{ outline: '2px solid', outlineColor: 'brand.focusRing' }}
            >
              <Link to={`/app/admin/feedback/${item.id}`}>
                <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="start" gap="3">
                  <Box minW="0">
                    <Text fontWeight="medium" lineClamp={1}>
                      {item.subject}
                    </Text>
                    <Text color="fg.muted" textStyle="supporting">
                      {item.username} · {formatTimeAgo(item.createdAt)}
                    </Text>
                  </Box>
                  <HStack gap="1" flexShrink="0" flexWrap="wrap">
                    <Badge colorPalette={item.status === 'NEW' ? 'orange' : 'gray'}>{formatLabel(item.status)}</Badge>
                    <Badge colorPalette="gray" variant="subtle">
                      {formatLabel(item.category)}
                    </Badge>
                  </HStack>
                </Flex>
              </Link>
            </ChakraLink>
          ))}
        </Stack>
      )}
    </Card.Body>
  </Card.Root>
);

const UserActivityChart = ({ users }: Pick<AdminOverview, 'users'>) => {
  const chart = useChart<AdminOverviewTrendPoint>({
    data: users.trend,
    series: [
      { name: 'recordedActiveUsers', color: 'brand.solid', label: 'Active users' },
      { name: 'newUsers', color: 'green.solid', label: 'New users' },
    ],
  });

  return (
    <Card.Root height="full">
      <Card.Header>
        <HStack gap="2">
          <LuUsers aria-hidden />
          <Text textStyle="sectionTitle">User activity, last 30 days</Text>
        </HStack>
        <Text color="fg.muted" textStyle="supporting">
          Users who signed in or made a change.
        </Text>
      </Card.Header>
      <Card.Body pt="0">
        <Chart.Root width="full" height={{ base: 'xs', md: 'sm' }} chart={chart} aria-label="Daily user activity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chart.data}>
              <defs>
                {chart.series.map((item) => (
                  <Chart.Gradient
                    key={item.name}
                    id={`admin-${item.name}`}
                    stops={[
                      { offset: '0%', color: item.color, opacity: 0.22 },
                      { offset: '100%', color: item.color, opacity: 0 },
                    ]}
                  />
                ))}
              </defs>
              <CartesianGrid stroke={chart.color('border.muted')} vertical={false} />
              <XAxis dataKey={chart.key('date')} tickFormatter={(value) => dayjs(value).format('DD MMM')} />
              <YAxis allowDecimals={false} />
              <Tooltip cursor={false} content={<Chart.Tooltip />} />
              <Legend content={<Chart.Legend />} />
              {chart.series.map((item) => (
                <Area
                  key={item.name}
                  type="monotone"
                  dataKey={chart.key(item.name)}
                  stroke={chart.color(item.color)}
                  fill={`url(#admin-${item.name})`}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </Chart.Root>
        <VisuallyHidden>
          {users.trend.map(
            (point) =>
              `${formatDate(point.date)}, ${point.recordedActiveUsers} active users, ${point.newUsers} new users.`,
          )}
        </VisuallyHidden>
      </Card.Body>
    </Card.Root>
  );
};

const ProviderHealth = ({ provider }: Pick<AdminOverview, 'provider'>) => (
  <Card.Root>
    <Card.Header>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align="start" gap="4">
        <Box>
          <HStack gap="2">
            <LuActivity aria-hidden />
            <Text textStyle="sectionTitle">Provider health</Text>
          </HStack>
          <Text color="fg.muted" textStyle="supporting" mt="1">
            Provider request metrics from the last 24 hours.
          </Text>
        </Box>
        <Button asChild variant="outline" colorPalette="gray" size="sm">
          <Link to="/app/admin/provider-usage">View details</Link>
        </Button>
      </Flex>
    </Card.Header>
    <Card.Body pt="0">
      {provider.status === 'unavailable' ? (
        <Text color="fg.muted">Provider metrics are temporarily unavailable.</Text>
      ) : (
        <SimpleGrid columns={{ base: 2, lg: 5 }} gap="4">
          <Box>
            <Text color="fg.muted" textStyle="supporting">Requests</Text>
            <Text fontSize="xl" fontWeight="semibold">{formatNumber(provider.summary.requestCount)}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" textStyle="supporting">Errors</Text>
            <Text fontSize="xl" fontWeight="semibold">{formatNumber(provider.summary.errorCount)}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" textStyle="supporting">Rate limited</Text>
            <Text fontSize="xl" fontWeight="semibold">{formatNumber(provider.summary.rateLimitedCount)}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" textStyle="supporting">Cache hit rate</Text>
            <Text fontSize="xl" fontWeight="semibold">{formatPercentage(provider.summary.cacheHitRate)}</Text>
          </Box>
          <Box>
            <Text color="fg.muted" textStyle="supporting">Average latency</Text>
            <Text fontSize="xl" fontWeight="semibold">{formatNumber(provider.summary.averageDurationMs)} ms</Text>
          </Box>
        </SimpleGrid>
      )}
    </Card.Body>
  </Card.Root>
);

const InstanceData = ({ instanceData }: Pick<AdminOverview, 'instanceData'>) => (
  <Card.Root>
    <Card.Header>
      <HStack gap="2">
        <LuServer aria-hidden />
        <Text textStyle="sectionTitle">Instance totals</Text>
      </HStack>
    </Card.Header>
    <Card.Body pt="0">
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4">
        <CompactMetric label="Tracked media" value={instanceData.trackedMediaRows} detail="Saved entries" />
        <CompactMetric label="Collections" value={instanceData.collections} detail="Total collections" />
        <CompactMetric label="Friendships" value={instanceData.acceptedFriendships} detail="Accepted connections" />
        <CompactMetric label="Administrators" value={instanceData.admins} detail="Admin accounts" />
      </SimpleGrid>
    </Card.Body>
  </Card.Root>
);

const AdminOverviewPage = () => {
  const { data, isLoading, isError, isFetching, refetch } = useAdminOverview();

  return (
    <Box>
      <PageHeader
        isFetching={isFetching}
        subHeader="Key activity and operational metrics."
        action={
          <Button
            colorPalette="gray"
            variant="outline"
            size="sm"
            aria-label="Refresh dashboard"
            loading={isFetching}
            onClick={() => void refetch()}
          >
            <LuRefreshCw aria-hidden />
            Refresh
          </Button>
        }
      >
        Administration
      </PageHeader>

      {isLoading ? (
        <OverviewSkeleton />
      ) : isError || !data ? (
        <ErrorState title="Dashboard unavailable" description="Failed to load the admin overview." onRetry={refetch} />
      ) : (
        <Stack gap="6">
          <Card.Root>
            <Card.Body>
              <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" gap="4">
                <Box>
                  <HStack gap="2" flexWrap="wrap">
                    <Badge colorPalette="brand" variant="subtle">{data.appName}</Badge>
                    <Badge colorPalette="gray" variant="subtle">v{data.appVersion}</Badge>
                  </HStack>
                </Box>
                <Text color="fg.muted" textStyle="supporting" alignSelf={{ base: 'start', md: 'center' }}>
                  Updated {formatTimeAgo(data.generatedAt)}
                </Text>
              </Flex>
            </Card.Body>
          </Card.Root>

          <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap="4">
            <MetricCard label="Total users" value={data.users.total} detail={`${formatNumber(data.instanceData.admins)} administrators`} />
            <MetricCard label="New users, 30 days" value={data.users.newLast30Days} detail={`${formatNumber(data.users.newLast7Days)} in the last 7 days`} />
            <MetricCard label="Active users, 30 days" value={data.users.recordedActiveLast30Days} detail={`${formatNumber(data.users.recordedActiveLast7Days)} in the last 7 days`} />
            <MetricCard label="Open feedback" value={data.feedback.openCount} detail={`${formatNumber(data.feedback.newCount)} new`} />
          </SimpleGrid>

          <Grid templateColumns={{ base: '1fr', xl: 'minmax(0, 1fr) minmax(0, 1.35fr)' }} gap="6">
            <FeedbackAttention feedback={data.feedback} />
            <UserActivityChart users={data.users} />
          </Grid>

          <ProviderHealth provider={data.provider} />
          <InstanceData instanceData={data.instanceData} />
        </Stack>
      )}
    </Box>
  );
};

export default AdminOverviewPage;
