import { useGenreAtom } from '@/atoms/genreAtom';
import { Badge, Box, Flex, Image, Text, VStack } from '@chakra-ui/react';
import { HiStar } from 'react-icons/hi';

import { Movie, Tv } from '@/types/media';
import { formatDate } from '@/lib/dateFns';
import CustomLinkOverlay from '../CustomLinkOverlay';
import MediaActions from './media-actions';

interface MediaCardProps {
  media: Movie | Tv;
  mediaType: 'movie' | 'tv';
  isLink?: boolean;
}

const MediaCard = ({ media, mediaType, isLink = false }: MediaCardProps) => {
  const genreMap = useGenreAtom();

  const WrapperElement = isLink ? CustomLinkOverlay : Box;

  return (
    <WrapperElement
      flex="0 0 200px"
      height="300px"
      borderRadius="lg"
      transition="transform 0.2s"
      position="relative"
      to={`/app/media/${mediaType}/${media.id}`}
    >
      <Image
        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
        alt={`${mediaType === 'movie' ? (media as Movie).title : (media as Tv).name} poster`}
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

      <VStack justify="space-between" position="relative" zIndex={2} h="100%" alignItems="flex-start" p={1}>
        <Flex justify="space-between" w="100%">
          <VStack gap={1} alignItems="flex-start">
            <Badge variant="surface" colorPalette="blackAlpha">
              <HiStar />

              {media.vote_average.toFixed(1)}

              <Text fontSize="sm" color="gray.400">
                from {media.vote_count} votes
              </Text>
            </Badge>

            <Badge variant="subtle">{media.adult ? 'R' : 'PG-13'}</Badge>

            <Badge variant="subtle">{media.media_type === 'movie' ? 'Movie' : 'TV'}</Badge>
          </VStack>

          <MediaActions media={media} />
        </Flex>

        <Box bg="blackAlpha.700" p={2} color="white" backdropFilter="blur(10px)" borderRadius="lg" w="100%">
          <Text fontSize="md" fontWeight="bold" lineClamp={2}>
            {mediaType === 'movie' ? (media as Movie).title : (media as Tv).name} (
            {formatDate(mediaType === 'movie' ? (media as Movie).release_date : (media as Tv).first_air_date, 'YYYY')})
          </Text>

          <Flex gap={1} overflowX="auto" css={{ scrollbarWidth: 'none' }} my={1} maxW="200px" overflow="auto">
            {media.genre_ids.map((genre) => (
              <Badge key={genre} variant="plain" colorPalette="cyan" mr={1}>
                {genreMap[genre]}
              </Badge>
            ))}
          </Flex>
        </Box>
      </VStack>
    </WrapperElement>
  );
};

export default MediaCard;
