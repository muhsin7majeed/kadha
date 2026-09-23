import { Badge, Box, Button, Card, SimpleGrid, Stack, Text } from '@chakra-ui/react';
import { LuArrowLeft } from 'react-icons/lu';
import { Link, useParams } from 'react-router';

import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useFeedbackItem from '@/features/feedback/api/use-feedback-item';
import { formatDate } from '@/utils/date';

const label = (value: string) => value.toLowerCase().replace('_', ' ').replace(/^./, (letter) => letter.toUpperCase());

const FeedbackDetail = () => {
  const { id } = useParams();
  const { data, isLoading, isError, isFetching, refetch } = useFeedbackItem(id);

  return <Box>
    <PageHeader isFetching={isFetching}>Feedback Detail</PageHeader>
    <Button asChild variant="ghost" colorPalette="gray" size="sm" mb="4"><Link to="/app/feedback"><LuArrowLeft />Feedback</Link></Button>
    {isLoading ? <CommonSpinner /> : isError || !data ? <ErrorState title="Error" description="Failed to load feedback" onRetry={refetch} /> : (
      <Stack gap="4">
        <Card.Root><Card.Body><Stack gap="3">
          <Stack direction={{ base: 'column', sm: 'row' }} justifyContent="space-between"><Text textStyle="sectionTitle" overflowWrap="anywhere">{data.subject}</Text><Badge alignSelf="flex-start" colorPalette="brand">{label(data.status)}</Badge></Stack>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
            <Box><Text color="fg.muted" textStyle="supporting">Category</Text><Text>{label(data.category)}</Text></Box>
            <Box><Text color="fg.muted" textStyle="supporting">Submitted</Text><Text>{formatDate(data.createdAt, 'DD MMM YYYY, HH:mm')}</Text></Box>
          </SimpleGrid>
        </Stack></Card.Body></Card.Root>
        <Card.Root><Card.Header><Text textStyle="subsectionTitle">Message</Text></Card.Header><Card.Body><Text whiteSpace="pre-wrap" overflowWrap="anywhere" color={data.message ? undefined : 'fg.muted'}>{data.message || 'No message provided.'}</Text></Card.Body></Card.Root>
        <Card.Root><Card.Header><Text textStyle="subsectionTitle">Response</Text></Card.Header><Card.Body><Text whiteSpace="pre-wrap" overflowWrap="anywhere" color={data.adminResponse ? undefined : 'fg.muted'}>{data.adminResponse || 'No response yet.'}</Text></Card.Body></Card.Root>
      </Stack>
    )}
  </Box>;
};

export default FeedbackDetail;
