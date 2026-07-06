import { Badge, Box, Button, Flex, HStack, Image, Stack, Text, VStack } from '@chakra-ui/react';
import {
  LuBookmark,
  LuBookmarkPlus,
  LuCalendar,
  LuCheck,
  LuClock,
  LuExternalLink,
  LuHeart,
  LuPlus,
  LuStar,
} from 'react-icons/lu';
import { useState } from 'react';

import AddToCollectionDialog from '@/features/collections/components/add-to-collection-dialog';
import type { MovieDetailsWithMeta, TvDetailsWithMeta } from '@/features/media/media.types';
import useAddToLiked from '@/features/user-media/api/use-add-to-liked';
import useAddToWatched from '@/features/user-media/api/use-add-to-watched';
import useAddToWatchList from '@/features/user-media/api/use-add-to-watch-list';
import type { MediaAction, TvProgressResponse } from '@/features/user-media/user-media.types';
import MediaTrackingDialog from '@/features/user-media/components/media-tracking-dialog';
import buildUserMediaPayload from '@/features/user-media/utils/build-user-media-payload';
import { getMediaActionStateLabel } from '@/features/user-media/utils/media-action-copy';
import { getTvProgressPrimaryActionLabel } from '@/features/user-media/utils/tv-progress';
import { formatDate, minutesToHours } from '@/utils/date';

interface HeroSectionProps {
  data: MovieDetailsWithMeta | TvDetailsWithMeta;
  tvProgress?: TvProgressResponse;
  isTvProgressLoading?: boolean;
  isMarkingNextEpisode?: boolean;
  onMarkNextEpisode?: () => void;
  onOpenTvProgress?: () => void;
}

const HeroSection = ({
  data,
  tvProgress,
  isTvProgressLoading,
  isMarkingNextEpisode,
  onMarkNextEpisode,
  onOpenTvProgress,
}: HeroSectionProps) => {
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false);
  const [trackingAction, setTrackingAction] = useState<MediaAction | null>(null);
  const isMovie = data.media_type === 'movie';
  const title = data.media_type === 'movie' ? data.title : data.name;
  const releaseDate = data.media_type === 'movie' ? data.release_date : data.first_air_date;
  const runtime = data.media_type === 'movie' ? data.runtime : data.episode_run_time?.[0];
  const releaseYear = releaseDate ? formatDate(releaseDate, 'YYYY') : null;
  const mutedTextColor = 'fg.muted';
  const { mutateAsync: addToLiked, isPending: isAddingToLiked } = useAddToLiked();
  const { mutateAsync: addToWatched, isPending: isAddingToWatched } = useAddToWatched();
  const { mutateAsync: addToWatchList, isPending: isAddingToWatchList } = useAddToWatchList();
  const mediaPayload = buildUserMediaPayload(data);

  const getActionPayload = (action: MediaAction) => buildUserMediaPayload(data, action);

  const handleLike = async () => {
    if (isAddingToLiked) return;
    if (!data.liked) {
      setTrackingAction('liked');
      return;
    }

    await addToLiked(getActionPayload('liked'));
  };

  const handleWatched = async () => {
    if (isAddingToWatched) return;
    if (!isMovie) {
      if (tvProgress?.status === 'in_progress' && tvProgress.nextEpisode) {
        onMarkNextEpisode?.();
        return;
      }

      onOpenTvProgress?.();
      return;
    }

    if (!data.watched) {
      setTrackingAction('watched');
      return;
    }

    await addToWatched(getActionPayload('watched'));
  };

  const handleWatchlist = async () => {
    if (isAddingToWatchList) return;
    if (!data.watchlist) {
      setTrackingAction('watchlist');
      return;
    }

    await addToWatchList(getActionPayload('watchlist'));
  };

  const handleCollection = () => {
    setShowAddToCollectionDialog(true);
  };

  return (
    <>
      <AddToCollectionDialog
        media={mediaPayload}
        open={showAddToCollectionDialog}
        onOpenChange={setShowAddToCollectionDialog}
      />
      {trackingAction && (
        <MediaTrackingDialog
          action={trackingAction}
          context="detail-pre-action"
          media={mediaPayload}
          currentState={data}
          open
          onOpenChange={(open) => {
            if (!open) {
              setTrackingAction(null);
            }
          }}
        />
      )}

      <Box position="relative" overflow="hidden" bg="bg">
        {/* Backdrop Image */}
        <Box position="absolute" inset={0} width="100%" height="100%">
          <Box
            position="relative"
            width="100%"
            height="100%"
            _after={{
              content: '""',
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to bottom, rgba(0, 0, 0, 0.24) 0%, rgba(0, 0, 0, 0.64) 58%, var(--chakra-colors-bg) 100%)',
              zIndex: 0,
            }}
            _before={{
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
            {data.backdrop_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/original${data.backdrop_path}`}
                alt=""
                width="100%"
                height="100%"
                objectFit="cover"
                filter="brightness(0.72)"
                loading="eager"
              />
            ) : (
              <Box width="100%" height="100%" bg="bg.subtle" />
            )}
          </Box>
        </Box>

        {/* Content */}
        <Flex
          position="relative"
          zIndex={2}
          minH={{ base: 'auto', md: '620px' }}
          pt={{ base: '120px', md: '160px' }}
          pb={{ base: 8, md: 10 }}
          px={{ base: 4, md: 8 }}
          gap={{ base: 6, md: 10 }}
          direction={{ base: 'column', md: 'row' }}
          align={{ base: 'center', md: 'flex-end' }}
        >
          {/* Poster */}
          <Box flexShrink={0}>
            {data.poster_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
                alt={`${title} poster`}
                width={{ base: '200px', md: '280px' }}
                height={{ base: '300px', md: '420px' }}
                objectFit="cover"
                borderRadius="xl"
                boxShadow="2xl"
                loading="eager"
              />
            ) : (
              <Box
                width={{ base: '200px', md: '280px' }}
                height={{ base: '300px', md: '420px' }}
                bg="bg.subtle"
                borderRadius="xl"
                boxShadow="2xl"
                borderWidth="1px"
                borderColor="border"
                display="flex"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                px={4}
              >
                <Text color="fg.muted" fontWeight="medium">
                  No poster available
                </Text>
              </Box>
            )}
          </Box>

          {/* Info */}
          <VStack
            align={{ base: 'center', md: 'flex-start' }}
            gap={4}
            flex={1}
            maxW="3xl"
            color="fg"
            bg="bg"
            borderWidth="1px"
            borderColor="border"
            borderRadius="lg"
            p={{ base: 5, md: 6 }}
            width={{ base: 'full', md: 'auto' }}
            boxShadow="xl"
          >
            {/* Badges */}
            <HStack gap={2} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              <Badge colorPalette="brand" size="lg">
                {isMovie ? 'Movie' : 'TV Series'}
              </Badge>
              <Badge colorPalette={data.adult ? 'red' : 'gray'} size="lg">
                {data.adult ? 'Adult' : 'Standard'}
              </Badge>
              <Badge colorPalette="blue" size="lg">
                {data.status}
              </Badge>
            </HStack>

            {/* Title */}
            <Text
              as="h1"
              fontSize={{ base: '2xl', md: '4xl' }}
              fontWeight="bold"
              textAlign={{ base: 'center', md: 'left' }}
              lineHeight="tight"
              maxW="100%"
            >
              {title}{' '}
              {releaseYear && (
                <Text as="span" fontWeight="normal" color={mutedTextColor}>
                  ({releaseYear})
                </Text>
              )}
            </Text>

            {/* Quick Info */}
            <HStack gap={4} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              <HStack gap={1} color="yellow.400">
                <LuStar fill="currentColor" />
                <Text fontWeight="semibold">{data.vote_average.toFixed(1)}</Text>
                <Text color={mutedTextColor} fontSize="sm">
                  ({data.vote_count.toLocaleString()} votes)
                </Text>
              </HStack>

              {releaseDate && (
                <HStack gap={1} color={mutedTextColor}>
                  <LuCalendar />
                  <Text>{formatDate(releaseDate, 'MMM DD, YYYY')}</Text>
                </HStack>
              )}

              {runtime && runtime > 0 && (
                <HStack gap={1} color={mutedTextColor}>
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
              <Text fontSize="lg" fontStyle="italic" color={mutedTextColor} textAlign={{ base: 'center', md: 'left' }}>
                "{data.tagline}"
              </Text>
            )}

            <Stack direction={{ base: 'column', sm: 'row' }} gap={3} mt={2} width={{ base: 'full', sm: 'auto' }}>
              <Button
                variant={data.liked ? 'solid' : 'outline'}
                colorPalette="red"
                onClick={handleLike}
                loading={isAddingToLiked}
              >
                <LuHeart fill={data.liked ? 'currentColor' : 'none'} />
                {getMediaActionStateLabel('liked', Boolean(data.liked))}
              </Button>
              <Button
                variant={!isMovie && tvProgress?.watchedEpisodeCount ? 'solid' : data.watched ? 'solid' : 'outline'}
                colorPalette="blue"
                onClick={handleWatched}
                loading={isMovie ? isAddingToWatched : isTvProgressLoading || isMarkingNextEpisode}
              >
                <LuCheck />
                {isMovie ? getMediaActionStateLabel('watched', Boolean(data.watched)) : getTvProgressPrimaryActionLabel(tvProgress)}
              </Button>
              <Button
                variant={data.watchlist ? 'solid' : 'outline'}
                colorPalette="green"
                onClick={handleWatchlist}
                loading={isAddingToWatchList}
              >
                {data.watchlist ? <LuBookmark fill="currentColor" /> : <LuBookmarkPlus />}
                {getMediaActionStateLabel('watchlist', Boolean(data.watchlist))}
              </Button>
              <Button variant="outline" colorPalette="brand" onClick={handleCollection}>
                <LuPlus />
                Add to collection
              </Button>
            </Stack>

            {/* Action Buttons */}
            <HStack gap={3} flexWrap="wrap" justify={{ base: 'center', md: 'flex-start' }}>
              {data.homepage && (
                <Button colorPalette="brand" size="md" asChild>
                  <a href={data.homepage} target="_blank" rel="noopener noreferrer">
                    <LuExternalLink />
                    Official Website
                  </a>
                </Button>
              )}
              {data.media_type === 'movie' && data.imdb_id && (
                <Button variant="outline" colorPalette="gray" size="md" asChild>
                  <a href={`https://www.imdb.com/title/${data.imdb_id}`} target="_blank" rel="noopener noreferrer">
                    IMDb
                  </a>
                </Button>
              )}
            </HStack>
          </VStack>
        </Flex>
      </Box>
    </>
  );
};

export default HeroSection;
