import {
  Badge,
  Box,
  Button,
  Card,
  CloseButton,
  Flex,
  Grid,
  HStack,
  IconButton,
  Image,
  Menu,
  Popover,
  Stack,
  Text,
} from '@chakra-ui/react';
import { LuBookmark, LuCheck, LuClock, LuEllipsis, LuHeart, LuInfo, LuStar } from 'react-icons/lu';

import { minutesToHours } from '@/utils/date';
import type { MediaCardLabItem } from './media-card-lab.data';

const posterPlaceholder = '/assets/images/image-placeholder.svg';

const posterUrl = (media: MediaCardLabItem) =>
  media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : posterPlaceholder;

const releaseYear = (media: MediaCardLabItem) => media.release_date.slice(0, 4);

const Poster = ({ media }: { media: MediaCardLabItem }) => (
  <Image
    src={posterUrl(media)}
    alt={`${media.title} poster`}
    onError={(event) => {
      event.currentTarget.src = posterPlaceholder;
    }}
    width="100%"
    height="100%"
    objectFit="cover"
  />
);

const Metadata = ({ media, compact = false }: { media: MediaCardLabItem; compact?: boolean }) => (
  <HStack gap="1.5" color="fg.muted" textStyle="supporting" flexWrap="wrap">
    <Text>{releaseYear(media)}</Text>
    <Text aria-hidden="true">·</Text>
    <Text>{media.media_type === 'movie' ? 'Movie' : 'TV'}</Text>
    {media.runtime ? (
      <>
        <Text aria-hidden="true">·</Text>
        <HStack gap="1">
          {!compact && <LuClock aria-hidden="true" />}
          <Text>
            {minutesToHours(media.runtime)}
            {media.media_type === 'tv' ? '/episode' : ''}
          </Text>
        </HStack>
      </>
    ) : null}
    <Text aria-hidden="true">·</Text>
    <HStack gap="1">
      <LuStar aria-hidden="true" fill="currentColor" />
      <Text>{media.vote_average.toFixed(1)}</Text>
    </HStack>
  </HStack>
);

const StatusSummary = ({ media, mode = 'badges' }: { media: MediaCardLabItem; mode?: 'badges' | 'text' }) => {
  const statuses: Array<{ label: string; icon: React.ReactNode; palette: string }> = [];

  if (media.liked) statuses.push({ label: 'Liked', icon: <LuHeart aria-hidden="true" />, palette: 'red' });
  if (media.watchlist) {
    statuses.push({ label: 'Watchlist', icon: <LuBookmark aria-hidden="true" />, palette: 'green' });
  }
  if (media.watched || media.watchCount) {
    statuses.push({
      label: media.watchCount && media.watchCount > 1 ? `Watched ×${media.watchCount}` : 'Watched',
      icon: <LuCheck aria-hidden="true" />,
      palette: 'blue',
    });
  }

  if (statuses.length === 0) {
    return (
      <Text color="fg.muted" textStyle="supporting">
        Not in your library
      </Text>
    );
  }

  if (mode === 'text') {
    return (
      <Text color="fg.muted" textStyle="supporting">
        {statuses.map((status) => status.label).join(' · ')}
      </Text>
    );
  }

  return (
    <Flex gap="1" flexWrap="wrap">
      {statuses.map((status) => (
        <Badge key={status.label} size="sm" variant="subtle" colorPalette={status.palette}>
          {status.icon}
          {status.label}
        </Badge>
      ))}
    </Flex>
  );
};

const ActionMenu = ({ media, inverted = false }: { media: MediaCardLabItem; inverted?: boolean }) => (
  <Menu.Root positioning={{ strategy: 'fixed' }}>
    <Menu.Trigger asChild>
      <IconButton
        aria-label={`Manage ${media.title}`}
        title={`Manage ${media.title}`}
        size="xs"
        variant={inverted ? 'solid' : 'subtle'}
        colorPalette="gray"
        borderRadius="full"
      >
        <LuEllipsis />
      </IconButton>
    </Menu.Trigger>
    <Menu.Positioner>
      <Menu.Content>
        <Menu.Item value="liked">
          <LuHeart />
          {media.liked ? 'Remove from liked' : 'Add to liked'}
        </Menu.Item>
        <Menu.Item value="watchlist">
          <LuBookmark />
          {media.watchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        </Menu.Item>
        <Menu.Item value="watched">
          <LuCheck />
          {media.watched || media.watchCount ? 'Manage watch history' : 'Mark watched'}
        </Menu.Item>
      </Menu.Content>
    </Menu.Positioner>
  </Menu.Root>
);

const QuickInfo = ({ media, label = false }: { media: MediaCardLabItem; label?: boolean }) => (
  <Popover.Root positioning={{ placement: 'bottom-end', strategy: 'fixed' }}>
    <Popover.Trigger asChild>
      {label ? (
        <Button size="xs" variant="outline" colorPalette="gray">
          <LuInfo />
          Quick info
        </Button>
      ) : (
        <IconButton
          aria-label={`Quick info about ${media.title}`}
          title={`Quick info about ${media.title}`}
          size="xs"
          variant="subtle"
          colorPalette="gray"
          borderRadius="full"
        >
          <LuInfo />
        </IconButton>
      )}
    </Popover.Trigger>
    <Popover.Positioner>
      <Popover.Content maxW={{ base: 'calc(100vw - 2rem)', sm: 'sm' }}>
        <Popover.Header>
          <Popover.Title textStyle="subsectionTitle">{media.title}</Popover.Title>
        </Popover.Header>
        <Popover.Body>
          <Stack gap="3">
            <Metadata media={media} />
            <Text textStyle="body">{media.overview}</Text>
            <Text color="fg.muted" textStyle="supporting">
              {media.genres.join(' · ')}
            </Text>
            <StatusSummary media={media} />
          </Stack>
        </Popover.Body>
        <Popover.CloseTrigger asChild>
          <CloseButton size="sm" />
        </Popover.CloseTrigger>
      </Popover.Content>
    </Popover.Positioner>
  </Popover.Root>
);

export const QuietPosterCard = ({ media }: { media: MediaCardLabItem }) => (
  <Card.Root as="article" variant="outline" overflow="hidden" bg="bg.panel" maxW="220px" width="full">
    <Box position="relative" aspectRatio="2 / 3" bg="bg.subtle">
      <Poster media={media} />
      <HStack position="absolute" top="2" right="2" gap="1">
        <QuickInfo media={media} />
        <ActionMenu media={media} />
      </HStack>
      <Box position="absolute" insetX="2" bottom="2" bg="bg.panel/90" backdropFilter="blur(8px)" borderRadius="md" p="1.5">
        <StatusSummary media={media} />
      </Box>
    </Box>
    <Card.Body p="3" gap="1.5">
      <Text textStyle="cardTitle" lineClamp={2}>{media.title}</Text>
      <Metadata media={media} compact />
    </Card.Body>
  </Card.Root>
);

export const EditorialCaptionCard = ({ media }: { media: MediaCardLabItem }) => (
  <Card.Root as="article" variant="outline" overflow="hidden" bg="bg.panel" maxW="280px" width="full">
    <Box aspectRatio="16 / 10" bg="bg.subtle" overflow="hidden">
      <Poster media={media} />
    </Box>
    <Card.Body p="4" gap="3">
      <HStack justify="space-between" align="start" gap="2">
        <Stack gap="1" minW="0">
          <Text textStyle="cardTitle" lineClamp={2}>{media.title}</Text>
          <Metadata media={media} compact />
        </Stack>
        <ActionMenu media={media} />
      </HStack>
      <Text textStyle="supporting" color="fg.muted" lineClamp={3}>{media.overview}</Text>
      <HStack justify="space-between" align="end" gap="2">
        <StatusSummary media={media} mode="text" />
        <QuickInfo media={media} />
      </HStack>
    </Card.Body>
  </Card.Root>
);

export const SplitDecisionCard = ({ media }: { media: MediaCardLabItem }) => (
  <Card.Root
    as="article"
    variant="outline"
    bg="bg.panel"
    overflow="hidden"
    width="full"
    maxW="2xl"
    display="grid"
    gridTemplateColumns={{ base: '96px minmax(0, 1fr)', sm: '150px minmax(0, 1fr)' }}
  >
    <Box bg="bg.subtle" minH={{ base: '160px', sm: '225px' }}>
      <Poster media={media} />
    </Box>
    <Card.Body p={{ base: '3', sm: '5' }} gap="3" minW="0">
      <HStack justify="space-between" align="start" gap="2">
        <Stack gap="1" minW="0">
          <Text textStyle="cardTitle" lineClamp={2}>{media.title}</Text>
          <Metadata media={media} compact />
        </Stack>
        <ActionMenu media={media} />
      </HStack>
      <Text textStyle="supporting" color="fg.muted" lineClamp={{ base: 3, sm: 4 }}>{media.overview}</Text>
      <Text textStyle="supporting" color="fg.muted" hideBelow="sm">{media.genres.join(' · ')}</Text>
      <HStack mt="auto" justify="space-between" align="end" gap="2" flexWrap="wrap">
        <StatusSummary media={media} />
        <QuickInfo media={media} label />
      </HStack>
    </Card.Body>
  </Card.Root>
);

export const FocusRevealCard = ({ media }: { media: MediaCardLabItem }) => (
  <Card.Root
    as="article"
    role="group"
    variant="outline"
    overflow="hidden"
    bg="bg.panel"
    maxW="220px"
    width="full"
    position="relative"
  >
    <Box position="relative" aspectRatio="2 / 3" bg="bg.subtle">
      <Poster media={media} />
      <Box
        position="absolute"
        inset="0"
        bg="blackAlpha.800"
        color="white"
        p="4"
        opacity="0"
        transition="opacity 0.2s"
        display="flex"
        flexDirection="column"
        justifyContent="end"
        _groupHover={{ opacity: 1 }}
        _groupFocusWithin={{ opacity: 1 }}
      >
        <Text textStyle="supporting" lineClamp={6}>{media.overview}</Text>
      </Box>
      <HStack position="absolute" top="2" right="2" gap="1">
        <QuickInfo media={media} />
        <ActionMenu media={media} inverted />
      </HStack>
      <Box position="absolute" left="2" right="2" bottom="2">
        <StatusSummary media={media} />
      </Box>
    </Box>
    <Card.Body p="3" gap="1.5">
      <Text textStyle="cardTitle" lineClamp={2}>{media.title}</Text>
      <Metadata media={media} compact />
    </Card.Body>
  </Card.Root>
);

export const CompactQuickViewCard = ({ media }: { media: MediaCardLabItem }) => (
  <Card.Root as="article" variant="outline" overflow="hidden" bg="bg.panel" maxW="220px" width="full">
    <Box aspectRatio="2 / 3" bg="bg.subtle">
      <Poster media={media} />
    </Box>
    <Card.Body p="3" gap="2.5">
      <HStack justify="space-between" align="start" gap="2">
        <Stack gap="1" minW="0">
          <Text textStyle="cardTitle" lineClamp={2}>{media.title}</Text>
          <Metadata media={media} compact />
        </Stack>
        <ActionMenu media={media} />
      </HStack>
      <StatusSummary media={media} />
      <QuickInfo media={media} label />
    </Card.Body>
  </Card.Root>
);

const OverlayControls = ({ media }: { media: MediaCardLabItem }) => (
  <HStack position="absolute" top="2" right="2" gap="1" zIndex="1">
    <QuickInfo media={media} />
    <ActionMenu media={media} />
  </HStack>
);

const OverlayStatus = ({ media, direction = 'row' }: { media: MediaCardLabItem; direction?: 'row' | 'column' }) => {
  const states = [
    media.liked ? { label: `Liked ${media.title}`, icon: <LuHeart aria-hidden="true" /> } : null,
    media.watchlist ? { label: `Watchlisted ${media.title}`, icon: <LuBookmark aria-hidden="true" /> } : null,
    media.watched || media.watchCount ? { label: `Watched ${media.title}`, icon: <LuCheck aria-hidden="true" /> } : null,
  ].filter((state) => state !== null);

  if (states.length === 0) return null;

  return (
    <Flex gap="1" direction={direction} align="start">
      {states.map((state) => (
        <Badge
          key={state.label}
          aria-label={state.label}
          title={state.label}
          bg="blackAlpha.800"
          color="white"
          p="1.5"
          borderRadius="full"
        >
          {state.icon}
        </Badge>
      ))}
    </Flex>
  );
};

const OverlayFacts = ({ media }: { media: MediaCardLabItem }) => (
  <HStack
    role="group"
    aria-label={`${media.title} facts`}
    gap="1"
    overflowX="auto"
    maxW="full"
    tabIndex={0}
    scrollbarWidth="thin"
  >
    <Badge flexShrink="0" bg="blackAlpha.800" color="white">
      <LuStar aria-hidden="true" />
      {media.vote_average.toFixed(1)}
    </Badge>
    <Badge flexShrink="0" bg="blackAlpha.800" color="white">{media.media_type === 'movie' ? 'Movie' : 'TV'}</Badge>
    <Badge flexShrink="0" bg="blackAlpha.800" color="white">{releaseYear(media)}</Badge>
    {media.runtime ? (
      <Badge flexShrink="0" bg="blackAlpha.800" color="white">
        {minutesToHours(media.runtime)}{media.media_type === 'tv' ? '/episode' : ''}
      </Badge>
    ) : null}
  </HStack>
);

const OverlayIdentity = ({ media }: { media: MediaCardLabItem }) => (
  <Stack gap="1" minW="0" color="white">
    <Box role="group" aria-label={`${media.title} title`} overflowX="auto" maxW="full" tabIndex={0} scrollbarWidth="thin">
      <Text as="h3" textStyle="cardTitle" whiteSpace="nowrap" width="max-content">{media.title}</Text>
    </Box>
    <HStack
      role="group"
      aria-label={`${media.title} genres`}
      overflowX="auto"
      maxW="full"
      gap="1.5"
      tabIndex={0}
      scrollbarWidth="thin"
    >
      {media.genres.map((genre) => (
        <Text key={genre} textStyle="supporting" whiteSpace="nowrap" flexShrink="0">{genre}</Text>
      ))}
    </HStack>
  </Stack>
);

const OverlayPoster = ({ media, children }: { media: MediaCardLabItem; children: React.ReactNode }) => (
  <Card.Root as="article" variant="outline" overflow="hidden" bg="bg.subtle" maxW="220px" width="full">
    <Box position="relative" aspectRatio="2 / 3" minW="0">
      <Poster media={media} />
      {children}
      <OverlayControls media={media} />
    </Box>
  </Card.Root>
);

export const CinematicGradientCard = ({ media }: { media: MediaCardLabItem }) => (
  <OverlayPoster media={media}>
    <Box
      position="absolute"
      inset="0"
      bgGradient="to-t"
      gradientFrom="blackAlpha.950"
      gradientVia="blackAlpha.500"
      gradientTo="transparent"
      pointerEvents="none"
    />
    <Stack position="absolute" left="3" right="3" bottom="3" gap="2.5">
      <OverlayStatus media={media} />
      <OverlayFacts media={media} />
      <OverlayIdentity media={media} />
    </Stack>
  </OverlayPoster>
);

export const StatusRailCard = ({ media }: { media: MediaCardLabItem }) => (
  <OverlayPoster media={media}>
    <Box position="absolute" top="2" left="2">
      <OverlayStatus media={media} direction="column" />
    </Box>
    <Stack position="absolute" insetX="0" bottom="0" p="3" pt="10" gap="2" bgGradient="to-t" gradientFrom="blackAlpha.950" gradientTo="transparent">
      <OverlayFacts media={media} />
      <OverlayIdentity media={media} />
    </Stack>
  </OverlayPoster>
);

export const GlassCaptionCard = ({ media }: { media: MediaCardLabItem }) => (
  <OverlayPoster media={media}>
    <Box position="absolute" top="2" left="2">
      <OverlayStatus media={media} />
    </Box>
    <Stack
      position="absolute"
      bottom="2"
      left="2"
      right="2"
      p="2.5"
      gap="2"
      bg="blackAlpha.800"
      backdropFilter="blur(14px)"
      borderWidth="1px"
      borderColor="whiteAlpha.400"
      borderRadius="lg"
      minW="0"
    >
      <OverlayIdentity media={media} />
      <OverlayFacts media={media} />
    </Stack>
  </OverlayPoster>
);

interface ConceptSectionProps {
  description: string;
  items: MediaCardLabItem[];
  name: string;
  renderCard: (media: MediaCardLabItem) => React.ReactNode;
  wide?: boolean;
}

export const ConceptSection = ({ description, items, name, renderCard, wide = false }: ConceptSectionProps) => {
  const conceptId = `concept-${name.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Box as="section" aria-labelledby={conceptId}>
      <Stack gap="4">
        <Stack gap="1">
          <Text as="h2" id={conceptId} textStyle="sectionTitle">
            {name}
          </Text>
          <Text color="fg.muted" textStyle="supporting" maxW="3xl">{description}</Text>
        </Stack>
        <Grid
          gap="4"
          templateColumns={wide ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 13.75rem), 1fr))'}
          justifyItems={wide ? 'stretch' : 'center'}
        >
          {items.map((media) => (
            <Box key={`${name}-${media.media_type}-${media.media_id}`} width="full" display="flex" justifyContent="center">
              {renderCard(media)}
            </Box>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};
