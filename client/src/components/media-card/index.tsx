import { Badge, Box, Card, Flex, Image, Text } from '@chakra-ui/react';
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
  maxW?: BoxProps['maxW'];
}

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
  const runtime = media.runtime && media.runtime > 0 ? media.runtime : null;
  const genres = media.genre_ids.map((genre) => genreMap[genre]).filter(Boolean).join(' · ');

  return (
    <Card.Root
      as="article"
      variant="outline"
      overflow="hidden"
      position="relative"
      cursor="pointer"
      bg="bg.panel"
      borderColor="border"
      shadow="sm"
      transition="transform 0.2s, box-shadow 0.2s"
      w={width}
      maxW={maxW}
      flexShrink={0}
      _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
    >
      <Box position="relative" aspectRatio="2 / 3" bg="bg.subtle">
        <Image
          src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
          alt={`${media.title} poster`}
          onError={(event) => {
            event.currentTarget.src = '/assets/images/image-placeholder.svg';
          }}
          width="100%"
          height="100%"
          objectFit="cover"
        />

        <Flex position="absolute" top="2" left="2" right="2" justify="space-between" align="start" gap="2">
          <Box minW="0" maxW="calc(100% - 3rem)">
            <Flex gap="1" flexWrap="wrap" align="center">
              {!showLibraryMetadata && (
                <Badge variant="subtle" colorPalette="gray">
                  <LuStar fill="yellow" />
                  {media.vote_average.toFixed(1)}
                  <Text as="span" hideBelow="md" textStyle="supporting">
                    from {media.vote_count} votes
                  </Text>
                </Badge>
              )}

              {showLibraryMetadata && (
                <Badge variant="subtle" colorPalette="gray">
                  TMDB {media.vote_average.toFixed(1)}
                </Badge>
              )}

              <Badge variant="subtle" colorPalette="gray">
                {media.adult ? 'R' : 'PG-13'}
              </Badge>

              <Badge variant="subtle" colorPalette="gray">
                {media.media_type === 'movie' ? 'Movie' : 'TV'}
              </Badge>

              {runtime !== null && (
                <Badge variant="subtle" colorPalette="gray">
                  {minutesToHours(runtime)}
                  {media.media_type === 'tv' ? '/episode' : ''}
                </Badge>
              )}

              {showLibraryMetadata && showPersonalRating && media.rating != null && (
                <Badge variant="solid" colorPalette="yellow">
                  Your rating {media.rating / 2}/5
                </Badge>
              )}

              {media.media_type === 'movie' && Boolean(media.watchCount) && (
                <Badge variant="solid" colorPalette="blue">
                  Watched ×{media.watchCount}
                </Badge>
              )}
            </Flex>
          </Box>

          {showActions && (
            <Box flexShrink="0" position="relative" zIndex="1">
              <MediaActions media={media} size={{ mdDown: 'xs', md: 'md' }} />
            </Box>
          )}
        </Flex>
      </Box>

      <Card.Body gap="1" p={{ base: 2, md: 3 }}>
        <NavLink
          to={`${detailsPathPrefix}/${media.media_type}/${media.media_id}`}
          textStyle="cardTitle"
          lineClamp={2}
          color="fg"
          _after={{
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
          }}
          onClick={onNavigate}
        >
          {media.title} ({formatDate(media.release_date, 'YYYY')})
        </NavLink>

        {genres ? (
          <Text color="fg.muted" textStyle="supporting" lineClamp={1} title={genres}>
            {genres}
          </Text>
        ) : null}
      </Card.Body>
    </Card.Root>
  );
};

export default MediaCard;
