import { Box, Button, Card, Field, NativeSelect, SimpleGrid, Stack, Text, Textarea } from '@chakra-ui/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { Link, useParams } from 'react-router';

import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useAdminFeedbackItem from '@/features/feedback/api/use-admin-feedback-item';
import useUpdateFeedback from '@/features/feedback/api/use-update-feedback';
import type { FeedbackStatus } from '@/features/feedback/feedback.types';
import { formatDate } from '@/utils/date';

const label = (value: string) => value.toLowerCase().replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase());

const AdminFeedbackDetail = () => {
  const { id } = useParams();
  const feedback = useAdminFeedbackItem(id);
  const updateFeedback = useUpdateFeedback();
  const [status, setStatus] = useState<FeedbackStatus>('NEW');
  const [adminResponse, setAdminResponse] = useState('');
  const initializedId = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!feedback.data || initializedId.current === feedback.data.id) return;
    initializedId.current = feedback.data.id;
    setStatus(feedback.data.status);
    setAdminResponse(feedback.data.adminResponse ?? '');
  }, [feedback.data]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!id) return;
    try {
      const updated = await updateFeedback.mutateAsync({ id, status, adminResponse });
      setStatus(updated.status);
      setAdminResponse(updated.adminResponse ?? '');
    } catch {
      return;
    }
  };

  return <Box>
    <PageHeader isFetching={feedback.isFetching}>Feedback Detail</PageHeader>
    <Button asChild variant="ghost" colorPalette="gray" size="sm" mb="4"><Link to="/app/admin/feedback"><LuArrowLeft />Feedback</Link></Button>
    {feedback.isLoading ? <CommonSpinner /> : feedback.isError || !feedback.data ? <ErrorState title="Error" description="Failed to load feedback" onRetry={feedback.refetch} /> : <Stack gap="4">
      <Card.Root><Card.Body><Stack gap="3"><Text textStyle="sectionTitle" overflowWrap="anywhere">{feedback.data.subject}</Text><SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
        <Box><Text color="fg.muted" textStyle="supporting">Submitted by</Text><Text>{feedback.data.username}</Text></Box>
        <Box><Text color="fg.muted" textStyle="supporting">Category</Text><Text>{label(feedback.data.category)}</Text></Box>
        <Box><Text color="fg.muted" textStyle="supporting">Submitted</Text><Text>{formatDate(feedback.data.createdAt, 'DD MMM YYYY, HH:mm')}</Text></Box>
        <Box><Text color="fg.muted" textStyle="supporting">Source and version</Text><Text overflowWrap="anywhere">{feedback.data.sourcePath || 'Unknown'} · {feedback.data.appVersion || 'Unknown'}</Text></Box>
      </SimpleGrid></Stack></Card.Body></Card.Root>
      <Card.Root><Card.Header><Text textStyle="subsectionTitle">Message</Text></Card.Header><Card.Body><Text whiteSpace="pre-wrap" overflowWrap="anywhere">{feedback.data.message}</Text></Card.Body></Card.Root>
      <Card.Root as="form" onSubmit={submit}><Card.Header><Text textStyle="subsectionTitle">Triage</Text></Card.Header><Card.Body><Stack gap="4">
        <Field.Root><Field.Label>Status</Field.Label><NativeSelect.Root disabled={updateFeedback.isPending}><NativeSelect.Field value={status} onChange={(event) => setStatus(event.target.value as FeedbackStatus)}><option value="NEW">New</option><option value="ACKNOWLEDGED">Acknowledged</option><option value="COMPLETED">Completed</option><option value="NOT_PLANNED">Not planned</option></NativeSelect.Field><NativeSelect.Indicator /></NativeSelect.Root></Field.Root>
        <Field.Root><Field.Label>Response to user</Field.Label><Textarea value={adminResponse} onChange={(event) => setAdminResponse(event.target.value)} maxLength={5000} minH="32" disabled={updateFeedback.isPending} /><Field.HelperText>One optional response. Plain text only.</Field.HelperText></Field.Root>
        <Button type="submit" colorPalette="brand" loading={updateFeedback.isPending} disabled={updateFeedback.isPending} alignSelf={{ base: 'stretch', md: 'flex-start' }}>Save update</Button>
      </Stack></Card.Body></Card.Root>
    </Stack>}
  </Box>;
};

export default AdminFeedbackDetail;
