import { Badge, Box, Button, Flex, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';
import { LuExternalLink, LuStar, LuCalendar, LuClock } from 'react-icons/lu';
import type { MovieDetails, TvDetails } from '@/types/media';
import { formatDate, minutesToHours } from '@/lib/date-fns';

interface HeroSectionProps {
  data: MovieDetails | TvDetails;
  mediaType: 'movie' | 'tv';
}

const HeroSection = ({ data, mediaType }: HeroSectionProps) => {
  const isMovie = mediaType === 'movie';
  const title = isMovie ? (data as MovieDetails).title : (data as TvDetails).name;
  const releaseDate = isMovie ? (data as MovieDetails).release_date : (data as TvDetails).first_air_date;
  const runtime = isMovie ? (data as MovieDetails).runtime : (data as TvDetails).episode_run_time?.[0];

  return (
    <Box position="relative">
      {/* Backdrop Image */}
      <Box position="absolute" top={0} left={0} width="100%" height="60vh" minHeight="400px">
        <Box
          position="relative"
          width="100%"
          height="100%"
          _after={{
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '70%',
            background: 'linear-gradient(to bottom, transparent 0%, var(--chakra-colors-bg) 100%)',
            zIndex: 1,
          }}
        >
          <Image
            src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
            alt={`${title} backdrop`}
            width="100%"
            height="100%"
            objectFit="cover"
            filter="brightness(0.4)"
            loading="lazy"
            borderRadius="lg"
          />
        </Box>
      </Box>

      {/* Content */}
      <Flex
        position="relative"
        zIndex={2}
        pt={{ base: '120px', md: '180px' }}
        pb={8}
        px={{ base: 4, md: 8 }}
        gap={{ base: 6, md: 10 }}
        direction={{ base: 'column', md: 'row' }}
        align={{ base: 'center', md: 'flex-end' }}
      >
        {/* Poster */}
        <Box flexShrink={0}>
          <Image
            src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
            alt={`${title} poster`}
            width={{ base: '200px', md: '280px' }}
            height={{ base: '300px', md: '420px' }}
            objectFit="cover"
            borderRadius="xl"
            boxShadow="2xl"
            loading="lazy"
          />
        </Box>

        {/* Info */}
        <VStack align={{ base: 'center', md: 'flex-start' }} gap={4} flex={1}>
          {/* Badges */}
          <HStack gap={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
            <Badge colorPalette="orange" size="lg">
              {isMovie ? 'Movie' : 'TV Series'}
            </Badge>
            <Badge colorPalette={data.adult ? 'red' : 'green'} size="lg">
              {data.adult ? 'R' : 'PG-13'}
            </Badge>
            <Badge colorPalette="blue" size="lg">
              {data.status}
            </Badge>
          </HStack>

          {/* Title */}
          <Text
            fontSize={{ base: '2xl', md: '4xl' }}
            fontWeight="bold"
            textAlign={{ base: 'center', md: 'left' }}
            lineHeight="tight"
          >
            {title}{' '}
            <Text as="span" fontWeight="normal" color="fg.muted">
              ({formatDate(releaseDate, 'YYYY')})
            </Text>
          </Text>

          {/* Quick Info */}
          <HStack gap={4} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
            <HStack gap={1} color="yellow.400">
              <LuStar fill="currentColor" />
              <Text fontWeight="semibold">{data.vote_average.toFixed(1)}</Text>
              <Text color="fg.muted" fontSize="sm">
                ({data.vote_count.toLocaleString()} votes)
              </Text>
            </HStack>

            <HStack gap={1} color="fg.muted">
              <LuCalendar />
              <Text>{formatDate(releaseDate, 'MMM DD, YYYY')}</Text>
            </HStack>

            {runtime && runtime > 0 && (
              <HStack gap={1} color="fg.muted">
                <LuClock />
                <Text>{minutesToHours(runtime)}</Text>
                {!isMovie && <Text fontSize="sm">/episode</Text>}
              </HStack>
            )}
          </HStack>

          {/* Genres */}
          <HStack gap={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
            {data.genres.map((genre) => (
              <Badge key={genre.id} variant="subtle" colorPalette="gray" size="md">
                {genre.name}
              </Badge>
            ))}
          </HStack>

          {/* Tagline */}
          {data.tagline && (
            <Text fontSize="lg" fontStyle="italic" color="fg.muted">
              "{data.tagline}"
            </Text>
          )}

          {/* Action Buttons */}
          <HStack gap={3} mt={2}>
            {data.homepage && (
              <Link asChild href={data.homepage} target="_blank" rel="noopener noreferrer">
                <Button colorPalette="orange" size="md">
                  <LuExternalLink />
                  Official Website
                </Button>
              </Link>
            )}
            {isMovie && (data as MovieDetails).imdb_id && (
              <Link
                asChild
                href={`https://www.imdb.com/title/${(data as MovieDetails).imdb_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md">
                  IMDb
                </Button>
              </Link>
            )}
          </HStack>
        </VStack>
      </Flex>
    </Box>
  );
};

export default HeroSection;
