import { Badge, Box, Flex, Image, Text, VStack } from '@chakra-ui/react';
import type { BoxProps } from '@chakra-ui/react';
import { LuStar } from 'react-icons/lu';

import { useGenreAtom } from '@/atoms/genre-atom';
import { MediaCardModel } from '@/features/media/media-card-model';
import { formatDate } from '@/utils/date';
import NavLink from '../nav-link';
import MediaActions from './media-actions';

interface MediaCardProps {
  media: MediaCardModel;
  onNavigate?: () => void;
  width?: BoxProps['width'];
}

const MediaCard = ({ media, onNavigate, width = { base: '150px', md: '100%' } }: MediaCardProps) => {
  const genreMap = useGenreAtom();

  return (
    <Box
      aspectRatio="2 / 3"
      borderRadius="lg"
      transition="transform 0.2s"
      position="relative"
      w={width}
      maxW="220px"
      flexShrink={0}
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
            <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="surface" colorPalette="blackAlpha">
              <LuStar fill="yellow" />

              {media.vote_average.toFixed(1)}

              <Text as="span" hideBelow="md" textStyle="supporting" color="gray.400">
                from {media.vote_count} votes
              </Text>
            </Badge>

            <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="subtle">
              {media.adult ? 'R' : 'PG-13'}
            </Badge>

            <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="subtle">
              {media.media_type === 'movie' ? 'Movie' : 'TV'}
            </Badge>

            {media.media_type === 'movie' && Boolean(media.watchCount) && (
              <Badge size={{ mdDown: 'xs', md: 'sm' }} variant="solid" colorPalette="blue">
                Watched ×{media.watchCount}
              </Badge>
            )}
          </VStack>

          <MediaActions media={media} size={{ mdDown: 'xs', md: 'md' }} />
        </Flex>

        <Box
          bg={{ _light: 'white', _dark: 'blackAlpha.700' }}
          p={{ base: 1, md: 2 }}
          color={{ _light: 'gray.950', _dark: 'white' }}
          backdropFilter="blur(10px)"
          borderRadius="lg"
          w="100%"
        >
          <NavLink
            to={`/app/media/${media.media_type}/${media.media_id}`}
            textStyle="cardTitle"
            lineClamp={2}
            onClick={onNavigate}
          >
            {media.title} ({formatDate(media.release_date, 'YYYY')})
          </NavLink>

          <Flex
            gap={1}
            w="100%"
            minW={0}
            maxW="100%"
            overflowX="auto"
            css={{ scrollbarWidth: 'none' }}
            my={{ base: 0, md: 1 }}
          >
            {media.genre_ids.map((genre) => (
              <Badge key={genre} size={{ mdDown: 'xs', md: 'sm' }} variant="plain" colorPalette="cyan" mr={1}>
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
