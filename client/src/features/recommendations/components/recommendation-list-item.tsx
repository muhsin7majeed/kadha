import { Badge, Box, Button, Card, Flex, Heading, HStack, List, Stack, Text } from '@chakra-ui/react';
import { LuEyeOff, LuThumbsDown, LuThumbsUp } from 'react-icons/lu';

import MediaCard from '@/components/media-card';
import useSaveRecommendationFeedback from '@/features/recommendations/api/use-save-recommendation-feedback';
import type { RecommendationItem } from '@/features/recommendations/recommendations.types';

interface RecommendationListItemProps {
  item: RecommendationItem;
}

const toFeedbackPayload = (item: RecommendationItem, type: 'MORE_LIKE_THIS' | 'LESS_LIKE_THIS' | 'HIDE') => ({
  media_id: item.media.media_id,
  media_type: item.media.media_type,
  type,
  title: item.media.title,
  original_title: item.media.original_title,
  overview: item.media.overview,
  poster_path: item.media.poster_path,
  backdrop_path: item.media.backdrop_path,
  vote_average: item.media.vote_average,
  vote_count: item.media.vote_count,
  popularity: item.media.popularity,
  adult: item.media.adult,
  genre_ids: item.media.genre_ids,
  release_date: item.media.release_date,
  original_language: item.media.original_language,
  runtime: item.media.runtime,
  status: item.media.status,
});

const RecommendationListItem = ({ item }: RecommendationListItemProps) => {
  const { mutate: saveFeedback, isPending } = useSaveRecommendationFeedback();

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <Flex direction={{ base: 'column', sm: 'row' }} gap="4" align={{ base: 'stretch', sm: 'flex-start' }}>
          <Box alignSelf={{ base: 'center', sm: 'flex-start' }}>
            <MediaCard media={item.media} width="100%" />
          </Box>

          <Stack flex="1" gap="4" minW="0">
            <Stack gap="2">
              <HStack justify="space-between" align="start" gap="3">
                <Heading as="h3" textStyle="subsectionTitle">
                  {item.media.title}
                </Heading>
                <Badge colorPalette="brand" variant="subtle" flexShrink={0}>
                  Score {item.score}
                </Badge>
              </HStack>

              <Text color="fg.muted" textStyle="body" lineClamp={3}>
                {item.media.overview || 'No overview available.'}
              </Text>
            </Stack>

            {item.reasons.length > 0 && (
              <Stack gap="2">
                <Text fontWeight="medium" textStyle="compactLabel">
                  Why this was recommended
                </Text>
                <List.Root gap="1" ps="4">
                  {item.reasons.map((reason) => (
                    <List.Item
                      key={`${reason.type}:${reason.label}:${reason.score}`}
                      color="fg.muted"
                      textStyle="supporting"
                    >
                      {reason.label}{' '}
                      <Text as="span" color="fg.subtle">
                        (+{reason.score})
                      </Text>
                    </List.Item>
                  ))}
                </List.Root>
              </Stack>
            )}

            <Stack direction={{ base: 'column', md: 'row' }} gap="2">
              <Button
                variant="outline"
                colorPalette="brand"
                size="sm"
                loading={isPending}
                disabled={isPending}
                onClick={() => saveFeedback(toFeedbackPayload(item, 'MORE_LIKE_THIS'))}
              >
                <LuThumbsUp />
                More like this
              </Button>
              <Button
                variant="outline"
                colorPalette="gray"
                size="sm"
                loading={isPending}
                disabled={isPending}
                onClick={() => saveFeedback(toFeedbackPayload(item, 'LESS_LIKE_THIS'))}
              >
                <LuThumbsDown />
                Less like this
              </Button>
              <Button
                variant="ghost"
                colorPalette="gray"
                size="sm"
                loading={isPending}
                disabled={isPending}
                onClick={() => saveFeedback(toFeedbackPayload(item, 'HIDE'))}
              >
                <LuEyeOff />
                Hide
              </Button>
            </Stack>
          </Stack>
        </Flex>
      </Card.Body>
    </Card.Root>
  );
};

export default RecommendationListItem;
