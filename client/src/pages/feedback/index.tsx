import { Badge, Box, Button, Card, Field, Input, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react';
import { FormEvent, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import PaginationControls from '@/components/pagination-controls';
import CommonSpinner from '@/components/spinners/common-spinner';
import { APP_CONFIG } from '@/config/app-config';
import useCreateFeedback from '@/features/feedback/api/use-create-feedback';
import useFeedback from '@/features/feedback/api/use-feedback';
import type { FeedbackCategory } from '@/features/feedback/feedback.types';
import { formatDate } from '@/utils/date';

const statusLabel = (status: string) => status.toLowerCase().replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase());

const FeedbackPage = () => {
  const location = useLocation();
  const sourcePath = (location.state as { sourcePath?: string } | null)?.sourcePath;
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState<FeedbackCategory>('GENERAL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const resultsRef = useRef<HTMLDivElement>(null);
  const createFeedback = useCreateFeedback();
  const feedback = useFeedback(page);
  const items = feedback.data?.data ?? [];

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await createFeedback.mutateAsync({ category, subject, message, sourcePath, appVersion: APP_CONFIG.version });
      setSubject('');
      setMessage('');
      setPage(1);
    } catch {
      return;
    }
  };

  return (
    <Box>
      <PageHeader subHeader={`Tell the team what is working, what is not, or what would make ${APP_CONFIG.appName} more useful.`}>
        Feedback
      </PageHeader>

      <Stack gap="6">
        <Card.Root as="form" onSubmit={submit} variant="outline">
          <Card.Header>
            <Text textStyle="sectionTitle">Send feedback</Text>
            <Text color="fg.muted" textStyle="supporting">Your submission is private and visible only to you and instance administrators.</Text>
          </Card.Header>
          <Card.Body>
            <Stack gap="4">
              <Field.Root required>
                <Field.Label>Category</Field.Label>
                <NativeSelect.Root disabled={createFeedback.isPending}>
                  <NativeSelect.Field value={category} onChange={(event) => setCategory(event.target.value as FeedbackCategory)}>
                    <option value="BUG">Bug</option>
                    <option value="SUGGESTION">Suggestion</option>
                    <option value="GENERAL">General feedback</option>
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
              </Field.Root>
              <Field.Root required>
                <Field.Label>Subject</Field.Label>
                <Input value={subject} onChange={(event) => setSubject(event.target.value)} minLength={3} maxLength={120} disabled={createFeedback.isPending} />
              </Field.Root>
              <Field.Root required>
                <Field.Label>Message</Field.Label>
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={5000} minH="32" disabled={createFeedback.isPending} />
              </Field.Root>
              <Button type="submit" colorPalette="brand" alignSelf={{ base: 'stretch', md: 'flex-start' }} loading={createFeedback.isPending} disabled={createFeedback.isPending}>
                Send feedback
              </Button>
            </Stack>
          </Card.Body>
        </Card.Root>

        <Box as="section" aria-labelledby="feedback-history-heading">
          <Text as="h2" id="feedback-history-heading" textStyle="sectionTitle" mb="3">Your feedback</Text>
          {feedback.isLoading ? <CommonSpinner /> : feedback.isError ? (
            <ErrorState title="Error" description="Failed to load feedback" onRetry={feedback.refetch} />
          ) : items.length === 0 ? (
            <EmptyState title="No feedback yet" description="Your submissions and their responses will appear here." />
          ) : (
            <Stack ref={resultsRef} gap="3">
              {items.map((item) => (
                <Card.Root key={item.id} variant="outline">
                  <Card.Body>
                    <Stack gap="2">
                      <Stack direction={{ base: 'column', sm: 'row' }} justifyContent="space-between" gap="2">
                        <Text fontWeight="semibold" overflowWrap="anywhere">{item.subject}</Text>
                        <Badge alignSelf="flex-start" colorPalette={item.status === 'COMPLETED' ? 'green' : item.status === 'NOT_PLANNED' ? 'gray' : 'brand'}>{statusLabel(item.status)}</Badge>
                      </Stack>
                      <Text color="fg.muted" textStyle="supporting">{formatDate(item.createdAt, 'DD MMM YYYY, HH:mm')}</Text>
                      <Button asChild size="sm" variant="outline" colorPalette="gray" alignSelf="flex-start">
                        <Link to={`/app/feedback/${item.id}`}>View details</Link>
                      </Button>
                    </Stack>
                  </Card.Body>
                </Card.Root>
              ))}
              <PaginationControls
                pagination={feedback.data?.pagination}
                onPageChange={setPage}
                isDisabled={feedback.isFetching}
                scrollTargetRef={resultsRef}
              />
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default FeedbackPage;
