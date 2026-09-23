import { Badge, Box, Card, CloseButton, Flex, HStack, IconButton, Image, Popover, Portal, Stack, Text } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { LuBookmark, LuCheck, LuHeart, LuInfo, LuStar } from 'react-icons/lu';

import { useGenreAtom } from '@/atoms/genre-atom';
import useMediaCardPreferences from '@/features/media-card-preferences/api/use-media-card-preferences';
import type { MediaCardModel } from '@/features/media/media-card-model';
import { minutesToHours } from '@/utils/date';
import NavLink from '@/components/nav-link';
import MediaActions from './media-actions';

interface MediaCardProps {
  media: MediaCardModel;
  onNavigate?: () => void;
  detailsPathPrefix?: string;
  showActions?: boolean;
  showLibraryMetadata?: boolean;
  showPersonalRating?: boolean;
  width?: BoxProps['width'];
  maxW?: BoxProps['maxW'];
}

const scrollStyle = {
  scrollbarWidth: 'none' as const,
  '&::-webkit-scrollbar': { display: 'none' },
};

const StatusIcons = ({ media, vertical = false }: { media: MediaCardModel; vertical?: boolean }) => {
  const states = [
    media.liked ? { label: `Liked ${media.title}`, icon: <LuHeart fill="currentColor" />, color: 'red.300' } : null,
    media.watchlist ? { label: `Watchlisted ${media.title}`, icon: <LuBookmark fill="currentColor" />, color: 'green.300' } : null,
    media.watched || media.watchCount ? { label: `Watched ${media.title}`, icon: <LuCheck fill="currentColor" />, color: 'blue.300' } : null,
  ].filter((state) => state !== null);

  if (!states.length) return null;
  return (
    <Flex role="group" aria-label={`${media.title} statuses`} direction={vertical ? 'column' : 'row'} gap="1" align="start">
      {states.map(({ label, icon, color }) => (
        <Box key={label} as="span" aria-label={label} title={label} color={color} bg="blackAlpha.800" p="1.5" borderRadius="full" lineHeight="1">
          {icon}
        </Box>
      ))}
    </Flex>
  );
};

const QuickInfo = ({ media, genres, showPersonalRating }: {
  media: MediaCardModel; genres: string[]; showPersonalRating: boolean;
}) => {
  const runtime = media.runtime && media.runtime > 0 ? minutesToHours(media.runtime) : null;
  const year = /^\d{4}/.exec(media.release_date)?.[0];
  return (
    <Popover.Root lazyMount unmountOnExit positioning={{ placement: 'bottom-end', strategy: 'fixed' }}>
      <Popover.Trigger asChild>
        <IconButton aria-label={`Quick info about ${media.title}`} title={`Quick info about ${media.title}`} size="xs" variant="solid" colorPalette="gray" borderRadius="full">
          <LuInfo />
        </IconButton>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW={{ base: 'calc(100vw - 2rem)', sm: 'sm' }}>
            <Popover.Header><Popover.Title textStyle="subsectionTitle">{media.title}</Popover.Title></Popover.Header>
            <Popover.Body>
              <Stack gap="3">
                <Text color="fg.muted" textStyle="supporting">
                  {[year, media.media_type === 'movie' ? 'Movie' : 'TV', runtime && `${runtime}${media.media_type === 'tv' ? '/episode' : ''}`, `TMDB ${media.vote_average.toFixed(1)}`].filter(Boolean).join(' · ')}
                </Text>
                <Text textStyle="body">{media.overview || 'No synopsis available.'}</Text>
                {genres.length > 0 && <Text color="fg.muted" textStyle="supporting">{genres.join(' · ')}</Text>}
                {showPersonalRating && media.rating != null && <Text textStyle="supporting">Your rating {media.rating / 2}/5</Text>}
                {(media.liked || media.watchlist || media.watched || media.watchCount) && (
                  <Text color="fg.muted" textStyle="supporting">
                    {[
                      media.liked && 'Liked', media.watchlist && 'Watchlist',
                      (media.watched || media.watchCount) && (media.watchCount && media.watchCount > 1 ? `Watched ×${media.watchCount}` : 'Watched'),
                    ].filter(Boolean).join(' · ')}
                  </Text>
                )}
              </Stack>
            </Popover.Body>
            <Popover.CloseTrigger asChild><CloseButton size="sm" /></Popover.CloseTrigger>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  );
};

const MediaCard = ({
  media,
  detailsPathPrefix = '/app/media',
  onNavigate,
  showActions = true,
  showLibraryMetadata = false,
  showPersonalRating = false,
  width = { base: '150px', md: '100%' },
  maxW = '220px',
}: MediaCardProps) => {
  const genreMap = useGenreAtom();
  const genres = media.genre_ids.map((genre) => genreMap[genre]).filter(Boolean);
  const { data: preferences } = useMediaCardPreferences();
  const minimal = preferences?.style === 'minimal';
  const runtime = media.runtime && media.runtime > 0 ? minutesToHours(media.runtime) : null;
  const year = /^\d{4}/.exec(media.release_date)?.[0];
  const detailsPath = `${detailsPathPrefix}/${media.media_type}/${media.media_id}`;

  return (
    <Card.Root
      as="article" variant="outline" overflow="hidden" position="relative" cursor="pointer"
      bg="bg.subtle" borderColor="border" shadow="sm" w={width} maxW={maxW} flexShrink={0}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
    >
      <Box position="relative" aspectRatio="2 / 3" bg="bg.subtle" minW="0">
        <Image
          src={media.poster_path ? `https://image.tmdb.org/t/p/w500${media.poster_path}` : '/assets/images/image-placeholder.svg'}
          alt={`${media.title} poster`}
          onError={(event) => { event.currentTarget.src = '/assets/images/image-placeholder.svg'; }}
          width="100%" height="100%" objectFit="cover"
        />
        <NavLink
          to={detailsPath}
          aria-label={media.title}
          aria-hidden={minimal ? undefined : true}
          tabIndex={minimal ? undefined : -1}
          position="absolute" inset="0" zIndex="0"
          onClick={onNavigate}
        >
          <Box as="span" srOnly>{media.title}</Box>
        </NavLink>

        {!minimal && (
          <Stack role="group" aria-label={`${media.title} facts`} position="absolute" top="2" left="2" align="start" gap="1" pointerEvents="none" maxW="calc(100% - 5rem)">
            <Badge bg="blackAlpha.800" color="white">{media.media_type === 'movie' ? 'Movie' : 'TV'}</Badge>
            <Badge bg="yellow.900" color="yellow.100"><LuStar aria-hidden="true" fill="currentColor" />{media.vote_average.toFixed(1)}</Badge>
            {runtime && <Badge bg="blackAlpha.800" color="white">{runtime}{media.media_type === 'tv' ? '/episode' : ''}</Badge>}
            {year && <Badge bg="blackAlpha.800" color="white">{year}</Badge>}
          </Stack>
        )}
        {minimal && <Box position="absolute" top="2" left="2" pointerEvents="none"><StatusIcons media={media} vertical /></Box>}

        <HStack position="absolute" top="2" right="2" gap="1" zIndex="2">
          <QuickInfo media={media} genres={genres} showPersonalRating={showLibraryMetadata && showPersonalRating} />
          {showActions && <MediaActions media={media} presentation="menu" size="xs" />}
        </HStack>

        {!minimal && (
          <Stack position="absolute" bottom="0" insetX="0" p="3" pt="12" gap="2" minW="0" color="white" bgGradient="to-t" gradientFrom="blackAlpha.950" gradientVia="blackAlpha.700" gradientTo="transparent" pointerEvents="none">
            <Box pointerEvents="none"><StatusIcons media={media} /></Box>
            <Box role="group" aria-label={`${media.title} title`} overflowX="auto" maxW="full" tabIndex={0} pointerEvents="auto" position="relative" zIndex="1" css={scrollStyle}>
              <NavLink to={detailsPath} onClick={onNavigate} display="block" width="max-content" color="white">
                <Text as="h3" textStyle="cardTitle" whiteSpace="nowrap">{media.title}</Text>
              </NavLink>
            </Box>
            {genres.length > 0 && (
              <HStack role="group" aria-label={`${media.title} genres`} overflowX="auto" maxW="full" tabIndex={0} pointerEvents="auto" position="relative" zIndex="1" gap="1" css={scrollStyle}>
                {genres.map((genre) => <Badge key={genre} flexShrink="0" bg="whiteAlpha.300" color="white" whiteSpace="nowrap">{genre}</Badge>)}
              </HStack>
            )}
          </Stack>
        )}
      </Box>
    </Card.Root>
  );
};

export default MediaCard;
