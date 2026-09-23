import { Box, Button, Card, Heading, HStack, RadioGroup, SimpleGrid, Stack, Text } from '@chakra-ui/react';

import MediaCard from '@/components/media-card';

import ListSkeleton from '@/components/loading/list-skeleton';
import useMediaCardPreferences from '@/features/media-card-preferences/api/use-media-card-preferences';
import useUpdateMediaCardPreferences from '@/features/media-card-preferences/api/use-update-media-card-preferences';
import type { MediaCardStyle } from '@/features/media-card-preferences/media-card-preferences.types';
import type { MediaCardModel } from '@/features/media/media-card-model';

const options: { value: MediaCardStyle; label: string; description: string }[] = [
  { value: 'detailed', label: 'Detailed', description: 'Show title, genres, and key facts on the poster.' },
  { value: 'minimal', label: 'Minimal', description: 'Keep the poster clear, with just your status and controls.' },
];

const previewMedia: MediaCardModel = {
  adult: false,
  genre_ids: [],
  media_id: 0,
  media_type: 'movie',
  poster_path: null,
  release_date: '2025-01-01',
  runtime: 112,
  title: 'Sample title',
  vote_average: 8.2,
  vote_count: 120,
  liked: true,
  watched: false,
  watchlist: true,
};

const MediaCardSettingsSection = () => {
  const { data, isLoading, isError, refetch } = useMediaCardPreferences();
  const { mutate, isPending } = useUpdateMediaCardPreferences();

  if (isLoading) return <ListSkeleton label="Loading card style" rows={2} />;

  return (
    <Card.Root variant="outline">
      <Card.Header>
        <Heading as="h3" textStyle="subsectionTitle">Media cards</Heading>
        <Text color="fg.muted" textStyle="supporting">Choose how posters appear in grids and carousels. This choice follows your account.</Text>
      </Card.Header>
      <Card.Body pt="0">
        {isError || !data ? (
          <Stack align="start" gap="2">
            <Text>Could not load card style.</Text>
            <Button colorPalette="gray" variant="outline" onClick={() => void refetch()}>Try again</Button>
          </Stack>
        ) : (
          <RadioGroup.Root
            aria-label="Media card style"
            colorPalette="brand"
            value={data.style}
            disabled={isPending}
            onValueChange={({ value }) => {
              if (value === 'minimal' || value === 'detailed') mutate({ version: 1, style: value });
            }}
          >
            <SimpleGrid columns={{ base: 1, md: 2 }} gap="3">
              {options.map(({ value, label, description }) => (
                <RadioGroup.Item
                  key={value}
                  value={value}
                  display="block"
                  p="4"
                  borderWidth="1px"
                  borderColor={data.style === value ? 'brand.solid' : 'border'}
                  borderRadius="lg"
                  cursor="pointer"
                >
                  <RadioGroup.ItemHiddenInput />
                  <HStack align="start" gap="3">
                    <RadioGroup.ItemIndicator mt="1" />
                    <RadioGroup.ItemText textStyle="body">
                      {label}
                      <Text color="fg.muted" textStyle="supporting">{description}</Text>
                    </RadioGroup.ItemText>
                  </HStack>
                  <Stack mt="4" gap="2" align="center" data-testid={`preview-${value}`}>
                    <Box maxW="180px" w="full"><MediaCard media={previewMedia} previewStyle={value} width="100%" maxW="180px" /></Box>
                    <Text textStyle="compactLabel" color="fg.muted">Sample preview</Text>
                  </Stack>
                </RadioGroup.Item>
              ))}
            </SimpleGrid>
          </RadioGroup.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
};

export default MediaCardSettingsSection;
