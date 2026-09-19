import { Button, Field, Flex, Group, Input, InputGroup, NativeSelect } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { LuSearch } from 'react-icons/lu';

import type {
  OwnerMediaQuery,
  OwnerMediaSort,
  OwnerMediaSortOrder,
  OwnerMediaTypeFilter,
} from '@/features/user-media/user-media.types';

interface MediaLibraryToolbarProps {
  addedLabel: string;
  firstAddedLabel: string;
  disabled?: boolean;
  filtersControl: React.ReactNode;
  query: OwnerMediaQuery;
  supportsPersonalRating?: boolean;
  updateQuery: (patch: Partial<OwnerMediaQuery>, options?: { replace?: boolean }) => void;
}

const mediaTypeItems: Array<{ label: string; value: OwnerMediaTypeFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV', value: 'tv' },
];

const MediaLibraryToolbar = ({
  addedLabel,
  firstAddedLabel,
  disabled,
  filtersControl,
  query,
  supportsPersonalRating = true,
  updateQuery,
}: MediaLibraryToolbarProps) => {
  const [searchValue, setSearchValue] = useState(query.query);

  useEffect(() => setSearchValue(query.query), [query.query]);

  useEffect(() => {
    const normalizedValue = searchValue.trim();
    if (normalizedValue === query.query) return;

    const timeout = window.setTimeout(() => updateQuery({ query: normalizedValue }, { replace: true }), 300);
    return () => window.clearTimeout(timeout);
  }, [query.query, searchValue, updateQuery]);

  const sortValue = `${query.sort}:${query.order}`;
  const handleSortChange = (value: string) => {
    const [sort, order] = value.split(':') as [OwnerMediaSort, OwnerMediaSortOrder];
    updateQuery({ sort, order });
  };

  return (
    <Flex
      as="section"
      aria-label="Library controls"
      align={{ base: 'stretch', lg: 'end' }}
      direction={{ base: 'column', lg: 'row' }}
      gap="3"
    >
      <Field.Root flex="1" minW={{ lg: '64' }}>
        <Field.Label>Search this library</Field.Label>
        <InputGroup startElement={<LuSearch aria-hidden />}>
          <Input
            aria-label="Search this library"
            maxLength={120}
            placeholder="Search by title"
            value={searchValue}
            onChange={(event) => setSearchValue(event.currentTarget.value)}
          />
        </InputGroup>
      </Field.Root>

      <Field.Root w={{ lg: '64' }}>
        <Field.Label>Media type</Field.Label>
        <Group attached aria-label="Filter library by media type" role="group">
          {mediaTypeItems.map((item) => (
            <Button
              key={item.value}
              aria-pressed={query.mediaType === item.value}
              colorPalette="gray"
              disabled={disabled}
              flex="1"
              size="sm"
              variant={query.mediaType === item.value ? 'solid' : 'outline'}
              onClick={() => updateQuery({ mediaType: item.value })}
            >
              {item.label}
            </Button>
          ))}
        </Group>
      </Field.Root>

      <Field.Root w={{ lg: '64' }}>
        <Field.Label>Sort by</Field.Label>
        <NativeSelect.Root disabled={disabled}>
          <NativeSelect.Field
            aria-label="Sort library"
            value={sortValue}
            onChange={(event) => handleSortChange(event.currentTarget.value)}
          >
            <option value="added:desc">{addedLabel}</option>
            <option value="added:asc">{firstAddedLabel}</option>
            <option value="title:asc">Title A–Z</option>
            <option value="title:desc">Title Z–A</option>
            <option value="releaseDate:desc">Newest release</option>
            <option value="releaseDate:asc">Oldest release</option>
            {query.mediaType !== 'all' && (
              <>
                <option value="runtime:asc">Shortest runtime</option>
                <option value="runtime:desc">Longest runtime</option>
              </>
            )}
            <option value="tmdbScore:desc">Highest TMDB score</option>
            <option value="tmdbScore:asc">Lowest TMDB score</option>
            {supportsPersonalRating && (
              <>
                <option value="rating:desc">Highest personal rating</option>
                <option value="rating:asc">Lowest personal rating</option>
              </>
            )}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>

      {filtersControl}
    </Flex>
  );
};

export default MediaLibraryToolbar;
