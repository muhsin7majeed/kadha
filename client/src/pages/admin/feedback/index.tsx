import { Badge, Box, Button, Card, HStack, NativeSelect, Stack, Table, Text } from '@chakra-ui/react';
import { useRef, useState } from 'react';
import { LuEye, LuMessageSquare } from 'react-icons/lu';
import { Link } from 'react-router';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import SearchInput from '@/components/search-input';
import CommonSpinner from '@/components/spinners/common-spinner';
import useAdminFeedback from '@/features/feedback/api/use-admin-feedback';
import type { FeedbackCategory, FeedbackStatus } from '@/features/feedback/feedback.types';
import { formatDate } from '@/utils/date';

const label = (value: string) => value.toLowerCase().replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase());

const AdminFeedback = () => {
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<FeedbackCategory | 'ALL'>('ALL');
  const [status, setStatus] = useState<FeedbackStatus | 'ALL'>('ALL');
  const resultsRef = useRef<HTMLDivElement>(null);
  const feedback = useAdminFeedback({ page, limit: 20, query, category, status, sort: 'createdAt', order: 'desc' });
  const items = feedback.data?.data ?? [];
  const reset = () => setPage(1);

  return <Box>
    <PageHeader isFetching={feedback.isFetching} subHeader="Review private submissions and keep users informed.">Admin Feedback</PageHeader>
    <Stack gap="4">
      <Stack direction={{ base: 'column', md: 'row' }} gap="3">
        <SearchInput placeholder="Search feedback or username" defaultValue={query} onSearchChange={(value) => { setQuery(value); reset(); }} />
        <NativeSelect.Root maxW={{ base: 'full', md: '48' }}><NativeSelect.Field aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value as FeedbackStatus | 'ALL'); reset(); }}>
          <option value="ALL">All statuses</option><option value="NEW">New</option><option value="ACKNOWLEDGED">Acknowledged</option><option value="COMPLETED">Completed</option><option value="NOT_PLANNED">Not planned</option>
        </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
        <NativeSelect.Root maxW={{ base: 'full', md: '48' }}><NativeSelect.Field aria-label="Filter by category" value={category} onChange={(event) => { setCategory(event.target.value as FeedbackCategory | 'ALL'); reset(); }}>
          <option value="ALL">All categories</option><option value="BUG">Bug</option><option value="SUGGESTION">Suggestion</option><option value="GENERAL">General</option>
        </NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root>
      </Stack>
      {feedback.isLoading ? <CommonSpinner /> : feedback.isError ? <ErrorState title="Error" description="Failed to load feedback" onRetry={feedback.refetch} /> : items.length === 0 ? <EmptyState title="No feedback found" description="Try different filters." icon={<LuMessageSquare />} /> : <>
        <Card.Root ref={resultsRef}><Box overflowX="auto"><Table.Root size="sm" minW="850px"><Table.Header><Table.Row><Table.ColumnHeader>Subject</Table.ColumnHeader><Table.ColumnHeader>User</Table.ColumnHeader><Table.ColumnHeader>Category</Table.ColumnHeader><Table.ColumnHeader>Status</Table.ColumnHeader><Table.ColumnHeader>Submitted</Table.ColumnHeader><Table.ColumnHeader>Source</Table.ColumnHeader><Table.ColumnHeader textAlign="right">Action</Table.ColumnHeader></Table.Row></Table.Header><Table.Body>
          {items.map((item) => <Table.Row key={item.id}><Table.Cell fontWeight="medium" maxW="64" overflowWrap="anywhere">{item.subject}</Table.Cell><Table.Cell>{item.username}</Table.Cell><Table.Cell>{label(item.category)}</Table.Cell><Table.Cell><Badge colorPalette={item.status === 'NEW' ? 'orange' : item.status === 'COMPLETED' ? 'green' : 'gray'}>{label(item.status)}</Badge></Table.Cell><Table.Cell>{formatDate(item.createdAt, 'DD MMM YYYY')}</Table.Cell><Table.Cell>{item.sourcePath || '—'}</Table.Cell><Table.Cell textAlign="right"><Button asChild size="xs" variant="outline" colorPalette="gray"><Link to={`/app/admin/feedback/${item.id}`}><LuEye />View</Link></Button></Table.Cell></Table.Row>)}
        </Table.Body></Table.Root></Box></Card.Root>
        <HStack justifyContent="space-between" flexWrap="wrap"><Text color="fg.muted" textStyle="supporting">{feedback.data?.pagination.total ?? 0} total submissions</Text><PaginationControls pagination={feedback.data?.pagination} onPageChange={setPage} isDisabled={feedback.isFetching} scrollTargetRef={resultsRef} /></HStack>
      </>}
    </Stack>
  </Box>;
};

export default AdminFeedback;
