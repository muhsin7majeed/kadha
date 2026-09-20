import { Badge, Box, Flex, Image, Text, VStack } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { LuStar } from 'react-icons/lu';

import { useGenreAtom } from '@/atoms/genre-atom';
import { MediaCardModel } from '@/features/media/media-card-model';
import { formatDate, minutesToHours } from '@/utils/date';
import NavLink from '../nav-link';
import MediaActions from './media-actions';

interface MediaCardProps {
  media: MediaCardModel;
  onNavigate?: () => void;
  detailsPathPrefix?: string;
  showActions?: boolean;
  showLibraryMetadata?: boolean;
  showPersonalRating?: boolean;
  width?: BoxProps['width'];
}

const MediaCard = ({
  media,
  detailsPathPrefix = '/app/media',
  onNavigate,
  showActions = true,
  showLibraryMetadata = false,
  showPersonalRating = false,
  width = { base: '150px', md: '100%' },
}: MediaCardProps) => {
  const genreMap = useGenreAtom();
  const runtime = media.runtime && media.runtime > 0 ? media.runtime : null;

  return (
    <Box
      aspectRatio="2 / 3"
      borderWidth="1px"
      borderColor="border"
      borderRadius="lg"
      overflow="hidden"
      shadow="sm"
      transition="transform 0.2s, box-shadow 0.2s"
      position="relative"
      w={width}
      maxW="220px"
      flexShrink={0}
      _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
    >
      <Image
        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
        alt={`${media.title} poster`}
        onError={(e) => {
          e.currentTarget.src = '/assets/images/image-placeholder.svg';
        }}
        width="100%"
        height="100%"
        objectFit="cover"
        borderRadius="lg"
        position="absolute"
        top={0}
        left={0}
      />

      <VStack
        justify="space-between"
        position="relative"
        zIndex={2}
        h="100%"
        alignItems="flex-start"
        p={{ base: 0.5, md: 1 }}
      >
        <Flex justify="space-between" w="100%">
          <VStack gap={1} alignItems="flex-start">
            {!showLibraryMetadata && (
              <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="surface" colorPalette="blackAlpha">
                <LuStar fill="yellow" />

                {media.vote_average.toFixed(1)}

                <Text as="span" hideBelow="md" textStyle="supporting" color="gray.400">
                  from {media.vote_count} votes
                </Text>
              </Badge>
            )}

            <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="subtle" colorPalette="gray">
              {media.adult ? 'R' : 'PG-13'}
            </Badge>

            <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="subtle" colorPalette="gray">
              {media.media_type === 'movie' ? 'Movie' : 'TV'}
            </Badge>

            {showLibraryMetadata && (
              <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="surface" colorPalette="blackAlpha">
                TMDB {media.vote_average.toFixed(1)}
              </Badge>
            )}

            {showLibraryMetadata && showPersonalRating && media.rating != null && (
              <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="solid" colorPalette="yellow">
                Your rating {media.rating / 2}/5
              </Badge>
            )}

            {media.media_type === 'movie' && Boolean(media.watchCount) && (
              <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="solid" colorPalette="blue">
                Watched ×{media.watchCount}
              </Badge>
            )}
          </VStack>

          {showActions && <MediaActions media={media} size={{ mdDown: 'xs', md: 'md' }} />}
        </Flex>

        <Box
          bg={{ _light: 'white', _dark: 'blackAlpha.700' }}
          p={{ base: 1, md: 2 }}
          color={{ _light: 'gray.950', _dark: 'white' }}
          backdropFilter="blur(10px)"
          borderRadius="lg"
          w="100%"
          minH={{ base: '5rem', md: '6rem' }}
        >
          <Box minH={{ base: '2.25rem', md: '2.75rem' }}>
            <NavLink
              to={`${detailsPathPrefix}/${media.media_type}/${media.media_id}`}
              textStyle="cardTitle"
              lineClamp={2}
              color="inherit"
              onClick={onNavigate}
            >
              {media.title} ({formatDate(media.release_date, 'YYYY')})
            </NavLink>
          </Box>

          <Flex
            gap={1}
            align="center"
            w="100%"
            minW={0}
            maxW="100%"
            minH={{ base: '1.25rem', md: '1.5rem' }}
            overflowX="auto"
            css={{ scrollbarWidth: 'none' }}
            my={{ base: 0, md: 1 }}
          >
            {runtime !== null && (
              <Badge flexShrink={0} size={{ mdDown: 'xs', md: 'sm' }} variant="subtle" colorPalette="gray">
                {minutesToHours(runtime)}
                {media.media_type === 'tv' ? '/episode' : ''}
              </Badge>
            )}

            {media.genre_ids.map((genre) => (
              <Badge key={genre} flexShrink={0} size={{ mdDown: 'xs', md: 'sm' }} variant="plain" colorPalette="gray">
                {genreMap[genre]}
              </Badge>
            ))}
          </Flex>
        </Box>
      </VStack>
    </Box>
  );
};

export default MediaCard;
