import { Badge, Box, Button, Card, HStack, NativeSelect, Stack, Table, Tabs, Text } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { LuEye, LuMessageSquare } from 'react-icons/lu';
import { Link } from 'react-router';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import SearchInput from '@/components/search-input';
import SimpleTabs from '@/components/simple-tabs';
import CommonSpinner from '@/components/spinners/common-spinner';
import useAdminFeedback from '@/features/feedback/api/use-admin-feedback';
import type {
  AdminFeedbackStatusFilter,
  FeedbackCategory,
  FeedbackStatus,
} from '@/features/feedback/feedback.types';
import { formatDate, formatTimeAgo } from '@/utils/date';

const label = (value: string) => value.toLowerCase().replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase());

const statusPalette = (status: FeedbackStatus) => {
  if (status === 'NEW') return 'orange';
  if (status === 'ACKNOWLEDGED') return 'blue';
  if (status === 'COMPLETED') return 'green';
  return 'gray';
};

const AdminFeedback = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | 'ALL'>('ALL');
  const [status, setStatus] = useState<AdminFeedbackStatusFilter>('OPEN');
  const resultsRef = useRef<HTMLDivElement>(null);
  const feedback = useAdminFeedback({ page, limit: 20, query, category, status, sort: 'createdAt', order: 'desc' });
  const items = feedback.data?.data ?? [];
  const summary = feedback.data?.summary;
  const reset = () => setPage(1);
  const statusTabs = [
    { value: 'OPEN', label: `Open ${summary?.openCount ?? 0}` },
    { value: 'NEW', label: `New ${summary?.newCount ?? 0}` },
    { value: 'ACKNOWLEDGED', label: `Acknowledged ${summary?.acknowledgedCount ?? 0}` },
    { value: 'COMPLETED', label: `Completed ${summary?.completedCount ?? 0}` },
    { value: 'NOT_PLANNED', label: `Not planned ${summary?.notPlannedCount ?? 0}` },
    { value: 'ALL', label: 'All' },
  ];

  return (
    <Box>
      <PageHeader isFetching={feedback.isFetching} subHeader="Review and respond to feedback.">
        Admin Feedback
      </PageHeader>

      <SimpleTabs
        tabs={statusTabs}
        value={status}
        onValueChange={(value) => {
          setStatus(value as AdminFeedbackStatusFilter);
          reset();
        }}
      >
        <Tabs.Content value={status} pt="4">
          <Stack gap="4">
          <Stack direction={{ base: 'column', md: 'row' }} gap="3">
            <SearchInput
              placeholder="Search feedback or username"
              defaultValue={query}
              onSearchChange={(value) => {
                setQuery(value);
                reset();
              }}
            />
            <NativeSelect.Root maxW={{ base: 'full', md: '48' }}>
              <NativeSelect.Field
                aria-label="Filter by category"
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value as FeedbackCategory | 'ALL');
                  reset();
                }}
              >
                <option value="ALL">All categories</option>
                <option value="BUG">Bug</option>
                <option value="SUGGESTION">Suggestion</option>
                <option value="GENERAL">General</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Stack>

          {feedback.isLoading ? (
            <CommonSpinner />
          ) : feedback.isError ? (
            <ErrorState title="Feedback unavailable" description="Failed to load feedback." onRetry={feedback.refetch} />
          ) : items.length === 0 ? (
            <EmptyState
              title={status === 'OPEN' ? 'No open feedback' : 'No feedback found'}
              description={
                status === 'OPEN' ? 'New and acknowledged feedback will appear here.' : 'Try different filters.'
              }
              icon={<LuMessageSquare />}
            />
          ) : (
            <>
              <Card.Root ref={resultsRef}>
                <Table.Root size="sm" tableLayout="fixed">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader width={{ base: 'auto', md: '30%' }}>Subject</Table.ColumnHeader>
                      <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>Category</Table.ColumnHeader>
                      <Table.ColumnHeader width={{ base: '28', md: 'auto' }}>Status</Table.ColumnHeader>
                      <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>Submitted</Table.ColumnHeader>
                      <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>Username</Table.ColumnHeader>
                      <Table.ColumnHeader width={{ base: '14', md: '24' }} textAlign="right">
                        Action
                      </Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {items.map((item) => (
                      <Table.Row key={item.id}>
                        <Table.Cell minW="0">
                          <Text fontWeight="medium" overflowWrap="anywhere" lineClamp={2}>
                            {item.subject}
                          </Text>
                          <Text display={{ base: 'block', md: 'none' }} color="fg.muted" textStyle="supporting">
                            {item.username} · {label(item.category)}
                          </Text>
                          <Text display={{ base: 'block', md: 'none' }} color="fg.muted" textStyle="supporting">
                            {formatTimeAgo(item.createdAt)} · {formatDate(item.createdAt, 'DD MMM YYYY')}
                          </Text>
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>{label(item.category)}</Table.Cell>
                        <Table.Cell>
                          <Badge colorPalette={statusPalette(item.status)}>{label(item.status)}</Badge>
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                          <Text>{formatTimeAgo(item.createdAt)}</Text>
                          <Text color="fg.muted" textStyle="supporting">
                            {formatDate(item.createdAt, 'DD MMM YYYY')}
                          </Text>
                        </Table.Cell>
                        <Table.Cell display={{ base: 'none', md: 'table-cell' }}>{item.username}</Table.Cell>
                        <Table.Cell textAlign="right">
                          <Button
                            asChild
                            size="xs"
                            variant="outline"
                            colorPalette="gray"
                            aria-label={`View ${item.subject}`}
                          >
                            <Link to={`/app/admin/feedback/${item.id}`}>
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
              <HStack justifyContent="space-between" flexWrap="wrap">
                <Text color="fg.muted" textStyle="supporting">
                  {feedback.data?.pagination.total ?? 0} matching submissions
                </Text>
                <PaginationControls
                  pagination={feedback.data?.pagination}
                  onPageChange={setPage}
                  isDisabled={feedback.isFetching}
                  scrollTargetRef={resultsRef}
                />
              </HStack>
            </>
          )}
          </Stack>
        </Tabs.Content>
      </SimpleTabs>
    </Box>
  );
};

export default AdminFeedback;
