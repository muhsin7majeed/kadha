import { Badge, Box, Flex, Grid, Image, Stack, Text, Wrap } from '@chakra-ui/react';

import { useGenreAtom } from '@/atoms/genre-atom';
import MediaActions from '@/components/media-card/media-actions';
import NavLink from '@/components/nav-link';
import { userMediaToMediaCardModel } from '@/features/media/media-card-model';
import type { OwnerMediaLibraryKey, UserMedia } from '@/features/user-media/user-media.types';
import {
  getOwnerLibraryMeta,
  getOwnerMediaDate,
  getOwnerMediaRuntime,
  getOwnerMediaScore,
  getOwnerMediaYear,
} from './owner-media-view-utils';

interface OwnerMediaListViewProps {
  data: UserMedia[];
  libraryKey: OwnerMediaLibraryKey;
  showPersonalRating: boolean;
}

const OwnerMediaListView = ({ data, libraryKey, showPersonalRating }: OwnerMediaListViewProps) => {
  const genreMap = useGenreAtom();
  const { dateLabel } = getOwnerLibraryMeta(libraryKey);

  return (
    <Stack gap="3">
      {data.map((media) => {
        const genres = media.genre_ids.map((genreId) => genreMap[genreId]).filter(Boolean);
        const year = getOwnerMediaYear(media);

        return (
          <Grid
            as="article"
            key={`${media.media_type}:${media.media_id}`}
            gridTemplateColumns={{ base: '64px minmax(0, 1fr) auto', md: '88px minmax(0, 1fr) auto' }}
            gap={{ base: '3', md: '4' }}
            alignItems="start"
            borderWidth="1px"
            borderColor="border.subtle"
            borderRadius="lg"
            bg="bg.panel"
            p={{ base: '3', md: '4' }}
          >
            <Image
              src={media.poster_path ? `https://image.tmdb.org/t/p/w185${media.poster_path}` : '/assets/images/image-placeholder.svg'}
              alt={`${media.title} poster`}
              aspectRatio="2 / 3"
              objectFit="cover"
              borderRadius="md"
              width="100%"
              onError={(event) => {
                event.currentTarget.src = '/assets/images/image-placeholder.svg';
              }}
            />

            <Stack gap="2" minW="0">
              <NavLink
                to={`/app/media/${media.media_type}/${media.media_id}`}
                textStyle="cardTitle"
                lineClamp={2}
              >
                {media.title} ({year})
              </NavLink>

              <Text color="fg.muted" textStyle="supporting" lineClamp={2}>
                {media.overview || 'No overview available.'}
              </Text>

              <Wrap gap="2">
                <Badge colorPalette="gray" variant="subtle">
                  {media.media_type === 'movie' ? 'Movie' : 'TV'}
                </Badge>
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <Badge key={genre} colorPalette="cyan" variant="subtle">
                      {genre}
                    </Badge>
                  ))
                ) : (
                  <Badge colorPalette="gray" variant="subtle">
                    Genres —
                  </Badge>
                )}
              </Wrap>

              <Flex gap={{ base: '2', md: '4' }} wrap="wrap" color="fg.muted" textStyle="compactLabel">
                <Text>{getOwnerMediaRuntime(media)}</Text>
                <Text>TMDB {getOwnerMediaScore(media)}</Text>
                {showPersonalRating && <Text>Your rating {media.rating != null ? `${media.rating / 2}/5` : '—'}</Text>}
                <Text>
                  {dateLabel} {getOwnerMediaDate(media, libraryKey)}
                </Text>
              </Flex>
            </Stack>

            <Box alignSelf="start">
              <MediaActions
                media={userMediaToMediaCardModel(media)}
                orientation={{ base: 'column', md: 'row' }}
                size="xs"
              />
            </Box>
          </Grid>
        );
      })}
    </Stack>
  );
};

export default OwnerMediaListView;
