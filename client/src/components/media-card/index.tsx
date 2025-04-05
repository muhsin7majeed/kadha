import { useGenreAtom } from '@/atoms/genreAtom';
import { Badge, Box, Image, Text } from '@chakra-ui/react';
import { HiStar } from 'react-icons/hi';

import { Movie, Tv } from '@/lib/types';
import { formatDate } from '@/lib/dateFns';

interface MediaCardProps {
  media: Movie | Tv;
  mediaType: 'movie' | 'tv';
}

const MediaCard = ({ media, mediaType }: MediaCardProps) => {
  const genreMap = useGenreAtom();

  return (
    <Box
      flex="0 0 200px"
      height="300px"
      borderRadius="lg"
      transition="transform 0.2s"
      _hover={{ transform: 'scale(1.05)' }}
      position="relative"
    >
      <Image
        src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
        alt={mediaType === 'movie' ? (media as Movie).title : (media as Tv).name}
        width="100%"
        height="100%"
        objectFit="cover"
      />

      <Badge position="absolute" top={2} left={2} variant="surface" colorPalette="blackAlpha">
        <HiStar />

        {media.vote_average.toFixed(1)}

        <Text fontSize="sm" color="gray.400">
          from {media.vote_count} votes
        </Text>
      </Badge>

      <Badge position="absolute" top={8} left={2} variant="subtle">
        {media.adult ? 'R' : 'PG-13'}
      </Badge>

      <Box position="absolute" bottom={0} left={0} right={0} bg="blackAlpha.700" p={2} color="white">
        <Text fontSize="md" fontWeight="bold" lineClamp={2}>
          {mediaType === 'movie' ? (media as Movie).title : (media as Tv).name} (
          {formatDate(mediaType === 'movie' ? (media as Movie).release_date : (media as Tv).first_air_date, 'YYYY')})
        </Text>

        {media.genre_ids.map((genre) => (
          <Badge key={genre} variant="plain" colorPalette="cyan" mr={1}>
            {genreMap[genre]}
          </Badge>
        ))}
      </Box>
    </Box>
  );
};

export default MediaCard;
