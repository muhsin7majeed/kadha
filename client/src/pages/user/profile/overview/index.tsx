import {
  Alert,
  Box,
  Button,
  Card,
  Heading,
  HStack,
  SegmentGroup,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { LuChartNoAxesColumnIncreasing, LuFilm, LuStar, LuTv } from 'react-icons/lu';
import { Link } from 'react-router';
import { useParams } from 'react-router';

import ErrorState from '@/components/info-states/error-state';
import InsightSection from '@/features/insights/components/insight-section';
import DistributionInsightList from '@/features/insights/components/distribution-insight-list';
import PeopleInsightList from '@/features/insights/components/people-insight-list';
import RankedInsightList from '@/features/insights/components/ranked-insight-list';
import useViewingInsights from '@/features/insights/api/use-viewing-insights';
import { InsightMediaType, ViewingInsights } from '@/features/insights/insights.types';
import { useAuth } from '@/features/auth/use-auth';

const mediaTypeItems = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV', value: 'tv' },
] satisfies Array<{ label: string; value: InsightMediaType }>;

interface InsightMediaFilterProps {
  disabled: boolean;
  mediaType: InsightMediaType;
  onChange: (mediaType: InsightMediaType) => void;
}

const InsightMediaFilter = ({ disabled, mediaType, onChange }: InsightMediaFilterProps) => (
  <SegmentGroup.Root
    aria-label="Filter overview by media type"
    orientation="horizontal"
    value={mediaType}
    onValueChange={(details) => onChange(details.value as InsightMediaType)}
    disabled={disabled}
    size="sm"
  >
    <SegmentGroup.Indicator />
    <SegmentGroup.Items items={mediaTypeItems} />
  </SegmentGroup.Root>
);

interface SummaryCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
}

const SummaryCard = ({ label, value, helper, icon }: SummaryCardProps) => (
  <Card.Root variant="outline">
    <Card.Body gap="2">
      <HStack color="fg.muted" justify="space-between">
        <Text textStyle="supporting">{label}</Text>
        <Box aria-hidden="true">{icon}</Box>
      </HStack>
      <Text fontSize={{ base: '2xl', md: '3xl' }} fontWeight="semibold" lineHeight="short">
        {value}
      </Text>
      {helper && (
        <Text color="fg.muted" textStyle="supporting">
          {helper}
        </Text>
      )}
    </Card.Body>
  </Card.Root>
);

const OverviewLoadingState = () => (
  <Stack gap="5" aria-label="Loading viewing overview">
    <Skeleton height="10" width={{ base: 'full', sm: '64' }} />
    <Skeleton height="32" borderRadius="lg" />
    <SimpleGrid columns={{ base: 2, lg: 4 }} gap="4">
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} height="28" borderRadius="lg" />
      ))}
    </SimpleGrid>
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5">
      <Skeleton height="80" borderRadius="lg" />
      <Skeleton height="80" borderRadius="lg" />
    </SimpleGrid>
  </Stack>
);

const getSignature = (data: ViewingInsights) => {
  if (data.viewingSignature.status === 'INSUFFICIENT_DATA') {
    return `Your viewing signature will take shape as you track more titles. This overview currently uses ${data.summary.watchedTitleCount}.`;
  }

  const clauses: string[] = [];
  if (data.viewingSignature.topGenre) clauses.push(`You gravitate toward ${data.viewingSignature.topGenre.label}`);
  if (data.viewingSignature.topMovieDirector) {
    clauses.push(`${data.viewingSignature.topMovieDirector.label} is your most-watched movie director`);
  }
  if (data.viewingSignature.topTvCreator) {
    clauses.push(`${data.viewingSignature.topTvCreator.label} leads your TV creators`);
  }
  if (data.viewingSignature.topCastMember) {
    clauses.push(`${data.viewingSignature.topCastMember.label} appears most often in your watched titles`);
  }

  return clauses.length > 0 ? `${clauses.join('. ')}.` : 'Your viewing signature is still gathering detail.';
};

const ViewingOverview = () => {
  const auth = useAuth();
  const { username = '' } = useParams();
  const isOwner = username.toLocaleLowerCase() === auth.user?.username?.toLocaleLowerCase();
  const [mediaType, setMediaType] = useState<InsightMediaType>('all');
  const { data, isLoading, isFetching, isError, refetch } = useViewingInsights(mediaType, isOwner);

  if (!isOwner) return null;

  if (isLoading) return <OverviewLoadingState />;
  if (isError || !data) {
    return (
      <ErrorState title="Overview unavailable" description="Could not load your viewing insights." onRetry={refetch} />
    );
  }

  if (data.summary.watchedTitleCount === 0) {
    return (
      <Stack gap="5">
        <HStack justify="flex-end">
          <InsightMediaFilter disabled={isFetching} mediaType={mediaType} onChange={setMediaType} />
        </HStack>
        <Card.Root variant="outline">
          <Card.Body alignItems="center" py="12" textAlign="center" gap="4">
            <Box color="brand.fg" fontSize="3xl" aria-hidden="true">
              <LuChartNoAxesColumnIncreasing />
            </Box>
            <Stack gap="2" maxW="lg">
              <Heading as="h2" textStyle="sectionTitle">
                {mediaType === 'all'
                  ? 'Your overview starts with a watched title'
                  : `No watched ${mediaType === 'movie' ? 'movies' : 'TV shows'} yet`}
              </Heading>
              <Text color="fg.muted" textStyle="supporting">
                Mark movies or TV episodes watched and Kadha will turn them into a private picture of your viewing.
              </Text>
            </Stack>
            <Button asChild colorPalette="brand">
              <Link to="/app">Discover something to watch</Link>
            </Button>
          </Card.Body>
        </Card.Root>
      </Stack>
    );
  }

  const creditsPartial = data.coverage.credits.status !== 'COMPLETE';

  return (
    <Stack gap="5">
      <HStack justify="space-between" align={{ base: 'stretch', sm: 'center' }} flexWrap="wrap" gap="3">
        <Box>
          <Heading as="h2" textStyle="sectionTitle">
            Viewing overview
          </Heading>
          <Text color="fg.muted" textStyle="supporting">
            All-time insights from your current tracked state.
          </Text>
        </Box>
        <InsightMediaFilter disabled={isFetching} mediaType={mediaType} onChange={setMediaType} />
      </HStack>

      <Card.Root variant="subtle" bg="brand.subtle">
        <Card.Body gap="2">
          <Text color="brand.fg" textStyle="compactLabel">
            Your viewing signature
          </Text>
          <Text textStyle="lead">{getSignature(data)}</Text>
          <Text color="fg.muted" textStyle="supporting">
            Based on {data.summary.watchedTitleCount} {data.summary.watchedTitleCount === 1 ? 'title' : 'titles'} marked
            watched.
          </Text>
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={{ base: 2, lg: 4 }} gap="4">
        <SummaryCard label="Watched titles" value={data.summary.watchedTitleCount} icon={<LuFilm />} />
        <SummaryCard label="Movies" value={data.summary.movieCount} icon={<LuFilm />} />
        <SummaryCard label="TV shows" value={data.summary.tvSeriesCount} icon={<LuTv />} />
        <SummaryCard
          label="Your average rating"
          value={data.summary.personalRating.average ?? '—'}
          helper={
            data.summary.personalRating.sampleSize > 0
              ? `${data.summary.personalRating.sampleSize} rated ${data.summary.personalRating.sampleSize === 1 ? 'title' : 'titles'}`
              : 'No rated watched titles yet'
          }
          icon={<LuStar />}
        />
      </SimpleGrid>

      {data.summary.watchedEpisodeCount > 0 && (
        <Text color="fg.muted" textStyle="supporting">
          You also have {data.summary.watchedEpisodeCount}{' '}
          {data.summary.watchedEpisodeCount === 1 ? 'episode' : 'episodes'} marked watched.
        </Text>
      )}

      {creditsPartial && (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>People insights are still filling in</Alert.Title>
            <Alert.Description>
              Credits are ready for {data.coverage.credits.coveredTitleCount} of {data.coverage.eligibleTitleCount}{' '}
              watched titles. Other totals remain complete.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="5" alignItems="start">
        <InsightSection
          title="Genres you watch most"
          description="A title can contribute to more than one genre, so percentages intentionally overlap."
        >
          <RankedInsightList items={data.rankings.genres} emptyText="Genre details are not available yet." />
        </InsightSection>

        <InsightSection
          title="Cast you see most"
          description="Counted once per title among the first ten billed cast members."
        >
          <PeopleInsightList items={data.rankings.cast} emptyText="Cast details are not available yet." />
        </InsightSection>

        {mediaType !== 'tv' && (
          <InsightSection title="Movie directors" description="Directing credits across your watched movies.">
            <PeopleInsightList items={data.rankings.movieDirectors} emptyText="No movie-director pattern yet." />
          </InsightSection>
        )}

        {mediaType !== 'movie' && (
          <InsightSection title="TV creators" description="Series creators across your watched shows.">
            <PeopleInsightList items={data.rankings.tvCreators} emptyText="No TV-creator pattern yet." />
          </InsightSection>
        )}

        <InsightSection title="Genres you like most" description="A separate taste signal based only on your likes.">
          <RankedInsightList items={data.rankings.likedGenres} emptyText="Like more titles to reveal this pattern." />
        </InsightSection>

        <InsightSection
          title="Your highest-rated genres"
          description="Genres need at least three personal ratings to appear."
        >
          <RankedInsightList
            items={data.rankings.highestRatedGenres}
            emptyText="Rate more watched titles to compare genres."
            valueFormatter={(item) => `${item.value.toFixed(1)} avg · ${item.sampleSize} rated`}
          />
        </InsightSection>

        <InsightSection title="Release decades" description="When the stories in your watched library were released.">
          <DistributionInsightList
            items={data.distributions.releaseDecades}
            emptyText="Release-decade details are not available yet."
          />
        </InsightSection>

        <InsightSection title="Original languages" description="The original languages across your watched titles.">
          <DistributionInsightList
            items={data.distributions.originalLanguages}
            emptyText="Original-language details are not available yet."
          />
        </InsightSection>
      </SimpleGrid>

      <Text color="fg.muted" textStyle="supporting">
        Counts describe your current library, not repeat watches. People are counted once per movie or TV series.
      </Text>
    </Stack>
  );
};

export default ViewingOverview;
