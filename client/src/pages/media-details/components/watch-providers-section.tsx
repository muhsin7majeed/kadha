import { Box, Heading, HStack, Link, Skeleton, Stack, Text, VStack } from '@chakra-ui/react';
import { LuExternalLink } from 'react-icons/lu';

import ErrorState from '@/components/info-states/error-state';
import { DEFAULT_WATCH_REGION } from '@/constants/watch-regions';
import useWatchProviders from '@/features/media/api/use-watch-providers';
import { useGetMe } from '@/features/user/api/use-get-me';
import { MediaType } from '@/types/common';
import ProviderChip from './provider-chip';
import WatchRegionDialog from './watch-region-dialog';
import { WATCH_PROVIDER_GROUPS } from './watch-provider-groups';

interface WatchProvidersSectionProps {
  mediaType: MediaType;
  id: string;
  title: string;
}

const WatchProvidersSection = ({ mediaType, id, title }: WatchProvidersSectionProps) => {
  const { data: me, isLoading: isLoadingMe } = useGetMe();
  const region = me?.watchRegion ?? DEFAULT_WATCH_REGION;
  const { data, isError, isLoading, refetch } = useWatchProviders(mediaType, id, region);

  if (isLoadingMe || isLoading) {
    return (
      <Box>
        <Skeleton height="8" maxW="56" mb={4} />
        <Stack gap={3}>
          <Skeleton height="10" maxW="xl" />
          <Skeleton height="10" maxW="lg" />
        </Stack>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box>
        <Heading size="lg" mb={3}>
          Where to Watch
        </Heading>
        <ErrorState
          title="Could not load watch options"
          description="Streaming availability is unavailable right now."
          onRetry={() => refetch()}
        />
      </Box>
    );
  }

  if (!data) return null;

  const visibleGroups = WATCH_PROVIDER_GROUPS.filter((group) => data.providers[group.key].length > 0);
  const hasRegionEntry = Boolean(data.link);

  return (
    <Box as="section">
      <VStack align="stretch" gap={4}>
        <Box>
          <Heading size="lg" mb={2}>
            Where to Watch
          </Heading>
          <HStack gap={2} color="fg.muted" flexWrap="wrap">
            <Text fontSize="sm">Based on your region: {data.region.name}</Text>
            <WatchRegionDialog currentRegion={data.region.code} me={me ?? undefined} />
          </HStack>
        </Box>

        {visibleGroups.length > 0 ? (
          <VStack align="stretch" gap={5}>
            {visibleGroups.map((group) => (
              <Box key={group.key}>
                <Heading size="sm" mb={3}>
                  {group.label}
                </Heading>
                <HStack gap={3} flexWrap="wrap">
                  {data.providers[group.key].map((provider) => (
                    <ProviderChip key={provider.id} provider={provider} title={title} sourceLink={data.link} />
                  ))}
                </HStack>
              </Box>
            ))}
          </VStack>
        ) : (
          <Box borderWidth="1px" borderColor="border" bg="bg.subtle" borderRadius="md" p={4}>
            <Text color="fg.muted">
              {hasRegionEntry
                ? `No streaming, rental, or purchase options are listed for ${data.region.name}.`
                : `No availability found for ${data.region.name}.`}
            </Text>
          </Box>
        )}

        <HStack gap={3} flexWrap="wrap">
          <Text fontSize="xs" color="fg.muted">
            Availability data provided by {data.attribution.provider}.
          </Text>
          {data.link && (
            <Link href={data.link} target="_blank" rel="noopener noreferrer" fontSize="xs" colorPalette="brand">
              <HStack gap={1}>
                <Text>View on TMDB</Text>
                <LuExternalLink />
              </HStack>
            </Link>
          )}
        </HStack>
      </VStack>
    </Box>
  );
};

export default WatchProvidersSection;
