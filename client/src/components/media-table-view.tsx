import { Table, Text } from '@chakra-ui/react';

import { useGenreAtom } from '@/atoms/genre-atom';
import MediaActions from '@/components/media-card/media-actions';
import NavLink from '@/components/nav-link';
import { getMediaRuntime, getMediaScore, getMediaYear } from '@/features/media/media-view-utils';
import type { MediaViewItem } from './media-list-view';

interface MediaTableViewProps {
  ariaLabel: string;
  data: MediaViewItem[];
  contextualDateLabel?: string;
  detailsPathPrefix?: string;
  minW?: string;
  scrollTestId?: string;
  showActions?: boolean;
  showPersonalRating?: boolean;
}

const stickyColumnProps = {
  position: 'sticky' as const,
  left: 0,
  bg: 'bg',
  borderRightWidth: '1px',
  borderRightColor: 'border.subtle',
};

const MediaTableView = ({
  ariaLabel,
  data,
  contextualDateLabel,
  detailsPathPrefix = '/app/media',
  minW = '48rem',
  scrollTestId = 'media-table-scroll',
  showActions = true,
  showPersonalRating = false,
}: MediaTableViewProps) => {
  const genreMap = useGenreAtom();

  return (
    <Table.ScrollArea data-testid={scrollTestId} borderWidth="1px" borderColor="border.subtle" borderRadius="lg">
      <Table.Root aria-label={ariaLabel} size="sm" minW={minW} variant="line">
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
            {contextualDateLabel && <Table.ColumnHeader>{contextualDateLabel}</Table.ColumnHeader>}
            {showActions && <Table.ColumnHeader textAlign="right">Actions</Table.ColumnHeader>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {data.map(({ media, contextualDate }) => {
            const genres = media.genre_ids.map((genreId) => genreMap[genreId]).filter(Boolean);

            return (
              <Table.Row key={`${media.media_type}:${media.media_id}`}>
                <Table.Cell {...stickyColumnProps} zIndex="1" maxW="18rem">
                  <NavLink
                    to={`${detailsPathPrefix}/${media.media_type}/${media.media_id}`}
                    fontWeight="semibold"
                    lineClamp={2}
                  >
                    {media.title}
                  </NavLink>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{getMediaYear(media)}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{media.media_type === 'movie' ? 'Movie' : 'TV'}</Table.Cell>
                <Table.Cell>
                  <Text lineClamp={2}>{genres.length > 0 ? genres.join(', ') : '—'}</Text>
                </Table.Cell>
                <Table.Cell whiteSpace="nowrap">{getMediaRuntime(media)}</Table.Cell>
                <Table.Cell whiteSpace="nowrap">{getMediaScore(media)}</Table.Cell>
                {showPersonalRating && (
                  <Table.Cell whiteSpace="nowrap">{media.rating != null ? `${media.rating / 2}/5` : '—'}</Table.Cell>
                )}
                {contextualDateLabel && <Table.Cell whiteSpace="nowrap">{contextualDate?.value ?? '—'}</Table.Cell>}
                {showActions && (
                  <Table.Cell>
                    <MediaActions media={media} orientation="row" size="xs" />
                  </Table.Cell>
                )}
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Table.ScrollArea>
  );
};

export default MediaTableView;
