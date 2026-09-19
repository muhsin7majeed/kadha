import { Table, Text } from '@chakra-ui/react';

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

interface OwnerMediaTableViewProps {
  data: UserMedia[];
  libraryKey: OwnerMediaLibraryKey;
  showPersonalRating: boolean;
}

const libraryNames: Record<OwnerMediaLibraryKey, string> = {
  liked: 'Liked',
  watched: 'Watched',
  watchlist: 'Watchlist',
};

const stickyColumnProps = {
  position: 'sticky' as const,
  left: 0,
  bg: 'bg',
  borderRightWidth: '1px',
  borderRightColor: 'border.subtle',
};

const OwnerMediaTableView = ({ data, libraryKey, showPersonalRating }: OwnerMediaTableViewProps) => {
  const genreMap = useGenreAtom();
  const { tableLabel } = getOwnerLibraryMeta(libraryKey);

  return (
    <Table.ScrollArea data-testid="owner-library-table-scroll" borderWidth="1px" borderColor="border.subtle" borderRadius="lg">
      <Table.Root aria-label={`${libraryNames[libraryKey]} library table`} size="sm" minW="56rem" variant="line">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader {...stickyColumnProps} zIndex="2" minW="13rem">
              Title
            </Table.ColumnHeader>
            <Table.ColumnHeader>Year</Table.ColumnHeader>
            <Table.ColumnHeader>Type</Table.ColumnHeader>
            <Table.ColumnHeader minW="12rem">Genres</Table.ColumnHeader>
            <Table.ColumnHeader>Runtime</Table.ColumnHeader>
            <Table.ColumnHeader>TMDB</Table.ColumnHeader>
            {showPersonalRating && <Table.ColumnHeader>Your rating</Table.ColumnHeader>}
            <Table.ColumnHeader>{tableLabel}</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map((media) => {
            const genres = media.genre_ids.map((genreId) => genreMap[genreId]).filter(Boolean);

            return (
              <Table.Row key={`${media.media_type}:${media.media_id}`}>
                <Table.Cell {...stickyColumnProps} zIndex="1" maxW="18rem">
                  <NavLink
                    to={`/app/media/${media.media_type}/${media.media_id}`}
                    fontWeight="semibold"
                    lineClamp={2}
                  >
                    {media.title}
                  </NavLink>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{getOwnerMediaYear(media)}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{media.media_type === 'movie' ? 'Movie' : 'TV'}</Table.Cell>
                <Table.Cell>
                  <Text lineClamp={2}>{genres.length > 0 ? genres.join(', ') : '—'}</Text>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{getOwnerMediaRuntime(media)}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{getOwnerMediaScore(media)}</Table.Cell>
                {showPersonalRating && (
                  <Table.Cell whiteSpace="nowrap">{media.rating != null ? `${media.rating / 2}/5` : '—'}</Table.Cell>
                )}
                <Table.Cell whiteSpace="nowrap">{getOwnerMediaDate(media, libraryKey)}</Table.Cell>
                <Table.Cell>
                  <MediaActions media={userMediaToMediaCardModel(media)} orientation="row" size="xs" />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};

export default OwnerMediaTableView;
