import { useGenreAtom } from '@/atoms/genreAtom';
import { Badge, Box, Image, Tag, Text } from '@chakra-ui/react';
import { HiStar } from 'react-icons/hi';

import { Movie } from '@/lib/types';
import { formatDate } from '@/lib/dateFns';

interface MediaCardProps {
  media: Movie;
}

const MediaCard = ({ media }: MediaCardProps) => {
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
        alt={media.title}
        width="100%"
        height="100%"
        objectFit="cover"
      />

      <Badge position="absolute" top={2} left={2} variant="surface" colorPalette="blackAlpha">
        <HiStar />

        {media.vote_average}

        <Text fontSize="sm" color="gray.400">
          from {media.vote_count} votes
        </Text>
      </Badge>

      <Tag.Root position="absolute" top={8} left={2} variant="subtle">
        <Tag.Label>{media.adult ? 'R' : 'PG-13'}</Tag.Label>
      </Tag.Root>

      <Box position="absolute" bottom={0} left={0} right={0} bg="blackAlpha.700" p={2} color="white">
        <Text fontSize="md" fontWeight="bold" lineClamp={2}>
          {media.title} ({formatDate(media.release_date, 'YYYY')})
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
