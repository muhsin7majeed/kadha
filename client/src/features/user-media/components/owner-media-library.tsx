import { Box, Button, Flex, Text, Wrap } from '@chakra-ui/react';
import { useEffect } from 'react';
import { LuX } from 'react-icons/lu';

import MediaListPage from '@/components/media-list-page';
import MediaViewSwitcher from '@/components/media-view-switcher';
import useOwnerLibraryView from '@/features/user-media/api/use-owner-library-view';
import { defaultOwnerMediaQuery } from '@/features/user-media/api/use-owner-media-query';
import type { UserMediaAccessResponse } from '@/features/user-media/api/use-watched';
import type { OwnerMediaLibraryKey, OwnerMediaQuery } from '@/features/user-media/user-media.types';
import MediaLibraryFilters from './media-library-filters';
import MediaLibraryToolbar from './media-library-toolbar';
import OwnerMediaListView from './owner-media-list-view';
import OwnerMediaTableView from './owner-media-table-view';

interface OwnerMediaLibraryProps {
  addedLabel: string;
  firstAddedLabel: string;
  description: string;
  emptyState: {
    title: string;
    description: string;
    icon: React.ReactNode;
  };
  error: Error | null;
  errorDescription: string;
  headerAction?: React.ReactNode;
  isFetching: boolean;
  isLoading: boolean;
  isPlaceholderData: boolean;
  loadingText: string;
  libraryKey: OwnerMediaLibraryKey;
  query: OwnerMediaQuery;
  refetch: () => void;
  response?: UserMediaAccessResponse;
  supportsPersonalRating?: boolean;
  title: string;
  updateQuery: (patch: Partial<OwnerMediaQuery>, options?: { replace?: boolean }) => void;
}

const filterCount = (query: OwnerMediaQuery, supportsPersonalRating: boolean) =>
  query.genres.length +
  Number(query.yearFrom !== undefined) +
  Number(query.yearTo !== undefined) +
  Number(supportsPersonalRating && query.rating !== 'any');

const hasCriteria = (query: OwnerMediaQuery) =>
  Boolean(
    query.query ||
      query.mediaType !== 'all' ||
      query.genres.length ||
      query.yearFrom !== undefined ||
      query.yearTo !== undefined ||
      query.rating !== 'any',
  );

const OwnerMediaLibrary = ({
  addedLabel,
  firstAddedLabel,
  description,
  emptyState,
  error,
  errorDescription,
  headerAction,
  isFetching,
  isLoading,
  isPlaceholderData,
  loadingText,
  libraryKey,
  query,
  refetch,
  response,
  supportsPersonalRating = true,
  title,
  updateQuery,
}: OwnerMediaLibraryProps) => {
  const { view, setView } = useOwnerLibraryView(libraryKey);
  const genreNames = new Map(response?.facets?.genres.map((genre) => [genre.id, genre.name]));
  const criteriaApplied = hasCriteria(query);
  const total = response?.pagination?.total;
  const targetPage = response?.pagination ? Math.max(1, response.pagination.totalPages) : query.page;
  const isCorrectingPage =
    !isLoading && !isPlaceholderData && response !== undefined && response.data.length === 0 && query.page > targetPage;

  useEffect(() => {
    if (isCorrectingPage) updateQuery({ page: targetPage }, { replace: true });
  }, [isCorrectingPage, targetPage, updateQuery]);

  const clearAll = () => updateQuery(defaultOwnerMediaQuery);
  const results =
    view === 'list' ? (
      <OwnerMediaListView
        data={response?.data ?? []}
        libraryKey={libraryKey}
        showPersonalRating={supportsPersonalRating}
      />
    ) : view === 'table' ? (
      <OwnerMediaTableView
        data={response?.data ?? []}
        libraryKey={libraryKey}
        showPersonalRating={supportsPersonalRating}
      />
    ) : undefined;
  const controls = (
    <Box bg="bg.subtle" borderColor="border.subtle" borderWidth="1px" borderRadius="lg" p={{ base: '3', md: '4' }} mb="6">
      <MediaLibraryToolbar
        addedLabel={addedLabel}
        firstAddedLabel={firstAddedLabel}
        disabled={isFetching}
        query={query}
        supportsPersonalRating={supportsPersonalRating}
        updateQuery={updateQuery}
        filtersControl={
          <MediaLibraryFilters
            activeCount={filterCount(query, supportsPersonalRating)}
            disabled={isFetching}
            facets={response?.facets}
            query={query}
            supportsPersonalRating={supportsPersonalRating}
            updateQuery={updateQuery}
          />
        }
      />

      <Flex justify="flex-end" mt="4">
        <MediaViewSwitcher value={view} onChange={setView} />
      </Flex>

      {criteriaApplied && (
        <Flex align="center" justify="space-between" gap="3" mt="4" wrap="wrap">
          <Wrap gap="2" aria-label="Applied library filters">
            {query.query && (
              <Button
                aria-label="Remove title search"
                colorPalette="gray"
                size="xs"
                variant="subtle"
                disabled={isFetching}
                onClick={() => updateQuery({ query: '' })}
              >
                “{query.query}” <LuX aria-hidden />
              </Button>
            )}
            {query.genres.map((genreId) => (
              <Button
                key={genreId}
                aria-label={`Remove ${genreNames.get(genreId) ?? `genre ${genreId}`} filter`}
                colorPalette="gray"
                disabled={isFetching}
                size="xs"
                variant="subtle"
                onClick={() => updateQuery({ genres: query.genres.filter((id) => id !== genreId) })}
              >
                {genreNames.get(genreId) ?? `Genre ${genreId}`} <LuX aria-hidden />
              </Button>
            ))}
            {query.yearFrom !== undefined && (
              <Button
                aria-label="Remove from year filter"
                colorPalette="gray"
                disabled={isFetching}
                size="xs"
                variant="subtle"
                onClick={() => updateQuery({ yearFrom: undefined })}
              >
                From {query.yearFrom} <LuX aria-hidden />
              </Button>
            )}
            {query.yearTo !== undefined && (
              <Button
                aria-label="Remove through year filter"
                colorPalette="gray"
                disabled={isFetching}
                size="xs"
                variant="subtle"
                onClick={() => updateQuery({ yearTo: undefined })}
              >
                Through {query.yearTo} <LuX aria-hidden />
              </Button>
            )}
            {supportsPersonalRating && query.rating !== 'any' && (
              <Button
                aria-label="Remove personal rating filter"
                colorPalette="gray"
                disabled={isFetching}
                size="xs"
                variant="subtle"
                onClick={() => updateQuery({ rating: 'any' })}
              >
                {query.rating === 'rated'
                  ? 'Rated'
                  : query.rating === 'unrated'
                    ? 'Not rated'
                    : `${query.rating / 2}+ stars`}{' '}
                <LuX aria-hidden />
              </Button>
            )}
          </Wrap>
          <Button colorPalette="gray" disabled={isFetching} size="xs" variant="ghost" onClick={clearAll}>
            Clear all
          </Button>
        </Flex>
      )}

      {!isLoading && isPlaceholderData && (
        <Text color="fg.muted" textStyle="supporting" mt="3" aria-live="polite">
          Updating results…
          {response?.data.length ? ' The titles below are from your previous filters.' : ''}
        </Text>
      )}

      {!isLoading && !isPlaceholderData && !isCorrectingPage && total !== undefined && (
        <Text color="fg.muted" textStyle="supporting" mt="3" aria-live="polite">
          {total.toLocaleString()} {total === 1 ? 'title' : 'titles'}
          {criteriaApplied ? ' match your filters' : ' in this library'}
        </Text>
      )}
    </Box>
  );

  return (
    <MediaListPage
      title={title}
      description={description}
      headerAction={headerAction}
      controls={controls}
      results={results}
      data={response?.data}
      isLoading={isLoading || isCorrectingPage || (isPlaceholderData && response?.data.length === 0)}
      isFetching={isFetching}
      error={error}
      refetch={refetch}
      emptyState={
        criteriaApplied && response?.facets?.total !== 0
          ? {
              title: 'No titles match these filters',
              description: 'Try removing a filter or clear everything to see your full library again.',
              icon: emptyState.icon,
            }
          : emptyState
      }
      errorDescription={errorDescription}
      loadingText={loadingText}
      showLibraryMetadata
      showPersonalRating={supportsPersonalRating}
      pagination={response?.pagination}
      onPageChange={(page) => updateQuery({ page })}
    />
  );
};

export default OwnerMediaLibrary;
