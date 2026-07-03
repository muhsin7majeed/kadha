import {
  Box,
  Button,
  Dialog,
  Field,
  Heading,
  HStack,
  Image,
  Link,
  NativeSelect,
  Portal,
  Skeleton,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuExternalLink } from 'react-icons/lu';

import { WATCH_REGIONS } from '@/constants/watch-regions';
import useWatchProviders from '@/features/media/api/use-watch-providers';
import { WatchProvider } from '@/features/media/media.types';
import { useGetMe } from '@/features/user/api/use-get-me';
import useUpdateMe from '@/features/user/api/use-update-me';
import { MediaType } from '@/types/common';

interface WatchProvidersSectionProps {
  mediaType: MediaType;
  id: string;
}

const providerGroups: Array<{
  key: 'stream' | 'rent' | 'buy' | 'free' | 'ads';
  label: string;
}> = [
  { key: 'stream', label: 'Stream' },
  { key: 'rent', label: 'Rent' },
  { key: 'buy', label: 'Buy' },
  { key: 'free', label: 'Free' },
  { key: 'ads', label: 'Ads' },
];

const ProviderChip = ({ provider }: { provider: WatchProvider }) => {
  return (
    <HStack
      gap={2}
      px={3}
      py={2}
      borderWidth="1px"
      borderColor="border"
      bg="bg.subtle"
      borderRadius="md"
      minH="10"
    >
      {provider.logoUrl && (
        <Image
          src={provider.logoUrl}
          alt={`${provider.name} logo`}
          boxSize="6"
          borderRadius="sm"
          objectFit="cover"
          flexShrink={0}
        />
      )}
      <Text fontSize="sm" fontWeight="medium">
        {provider.name}
      </Text>
    </HStack>
  );
};

const WatchRegionDialog = ({ currentRegion }: { currentRegion: string }) => {
  const { data: me } = useGetMe();
  const { mutateAsync: updateMe, isPending } = useUpdateMe();
  const [open, setOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(currentRegion);

  useEffect(() => {
    if (open) {
      setSelectedRegion(currentRegion);
    }
  }, [currentRegion, open]);

  const saveRegion = async () => {
    if (!me || isPending) return;

    await updateMe({
      username: me.username,
      profilePrivacy: me.profilePrivacy,
      watchedPrivacy: me.watchedPrivacy,
      likedPrivacy: me.likedPrivacy,
      watchlistPrivacy: me.watchlistPrivacy,
      watchRegion: selectedRegion,
    });
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(event) => setOpen(event.open)}>
      <Dialog.Trigger asChild>
        <Button variant="plain" size="xs" px={1} h="auto">
          Change
        </Button>
      </Dialog.Trigger>

      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Watch region</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Field.Root required>
                <Field.Label>Country</Field.Label>
                <NativeSelect.Root>
                  <NativeSelect.Field
                    value={selectedRegion}
                    onChange={(event) => setSelectedRegion(event.target.value)}
                    autoFocus
                  >
                    {WATCH_REGIONS.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name}
                      </option>
                    ))}
                  </NativeSelect.Field>
                  <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Field.HelperText>Choose the country used for streaming availability.</Field.HelperText>
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.ActionTrigger>
              <Button onClick={saveRegion} loading={isPending} disabled={!me || isPending}>
                Save
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

const WatchProvidersSection = ({ mediaType, id }: WatchProvidersSectionProps) => {
  const { data: me, isLoading: isLoadingMe } = useGetMe();
  const region = me?.watchRegion;
  const { data, isError, isLoading } = useWatchProviders(mediaType, id, region);

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
        <Text color="fg.muted">Could not load watch options right now.</Text>
      </Box>
    );
  }

  if (!data) return null;

  const visibleGroups = providerGroups.filter((group) => data.providers[group.key].length > 0);
  const hasRegionEntry = Boolean(data.link);

  return (
    <Box as="section">
      <VStack align="stretch" gap={4}>
        <Box>
          <Heading size="lg" mb={2}>
            Where to Watch
          </Heading>
          <HStack gap={1} color="fg.muted" flexWrap="wrap">
            <Text fontSize="sm">Based on your region: {data.region.name}</Text>
            <Text fontSize="sm">·</Text>
            <WatchRegionDialog currentRegion={data.region.code} />
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
                    <ProviderChip key={provider.id} provider={provider} />
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
            <Link href={data.link} target="_blank" rel="noreferrer" fontSize="xs" colorPalette="brand">
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
