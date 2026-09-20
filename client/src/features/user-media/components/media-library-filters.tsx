import {
  Badge,
  Button,
  Checkbox,
  CloseButton,
  Field,
  Fieldset,
  Input,
  NativeSelect,
  Popover,
  Portal,
  SimpleGrid,
  Stack,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useId, useState } from 'react';
import { LuSlidersHorizontal } from 'react-icons/lu';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import type {
  OwnerMediaFacets,
  OwnerMediaQuery,
  OwnerMediaRatingFilter,
} from '@/features/user-media/user-media.types';

interface MediaLibraryFiltersProps {
  activeCount: number;
  disabled?: boolean;
  facets?: OwnerMediaFacets;
  query: OwnerMediaQuery;
  supportsPersonalRating?: boolean;
  updateQuery: (patch: Partial<OwnerMediaQuery>) => void;
}

type FilterDraft = Pick<OwnerMediaQuery, 'genres' | 'yearFrom' | 'yearTo' | 'rating'>;

const getDraft = (query: OwnerMediaQuery): FilterDraft => ({
  genres: query.genres,
  yearFrom: query.yearFrom,
  yearTo: query.yearTo,
  rating: query.rating,
});

const toOptionalYear = (value: string) => (value ? Number(value) : undefined);

const isInvalidYear = (year: number | undefined, min: number, max: number) =>
  year !== undefined && (!Number.isInteger(year) || year < min || year > max);

const MediaLibraryFilters = ({
  activeCount,
  disabled,
  facets,
  query,
  supportsPersonalRating = true,
  updateQuery,
}: MediaLibraryFiltersProps) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<FilterDraft>(() => getDraft(query));
  const yearErrorId = useId();
  const useDesktopPopover = useBreakpointValue({ base: false, md: true }) ?? false;
  const minimumYear = facets?.years.min ?? 1874;
  const maximumYear = facets?.years.max ?? 9999;
  const invalidRange =
    draft.yearFrom !== undefined && draft.yearTo !== undefined && draft.yearFrom > draft.yearTo;
  const invalidYears =
    invalidRange ||
    isInvalidYear(draft.yearFrom, minimumYear, maximumYear) ||
    isInvalidYear(draft.yearTo, minimumYear, maximumYear);

  const setDialogOpen = (nextOpen: boolean) => {
    if (nextOpen) setDraft(getDraft(query));
    setOpen(nextOpen);
  };

  const toggleGenre = (genreId: number, checked: boolean) => {
    setDraft((current) => ({
      ...current,
      genres: checked
        ? [...new Set([...current.genres, genreId])].sort((first, second) => first - second)
        : current.genres.filter((id) => id !== genreId),
    }));
  };

  const footer = (
    <Stack direction={{ base: 'column-reverse', sm: 'row' }} justify="space-between" w="full" gap="3">
      <Button
        colorPalette="gray"
        variant="ghost"
        onClick={() => setDraft({ genres: [], rating: 'any', yearFrom: undefined, yearTo: undefined })}
      >
        Clear filters
      </Button>
      <Button
        colorPalette="brand"
        disabled={invalidYears}
        onClick={() => {
          updateQuery(draft);
          setOpen(false);
        }}
      >
        Apply filters
      </Button>
    </Stack>
  );

  const trigger = (
    <Button colorPalette="gray" disabled={disabled} variant="outline" w={{ base: 'full', lg: 'auto' }}>
      <LuSlidersHorizontal aria-hidden />
      Filters
      {activeCount > 0 && <Badge colorPalette="brand">{activeCount}</Badge>}
    </Button>
  );

  const filterFields = (
    <Stack gap="6">
      <Fieldset.Root>
        <Fieldset.Legend>Genres</Fieldset.Legend>
        {facets?.genres.length ? (
          <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
            {facets.genres.map((genre) => (
              <Checkbox.Root
                key={genre.id}
                checked={draft.genres.includes(genre.id)}
                colorPalette="brand"
                gap="2"
                onCheckedChange={(details) => toggleGenre(genre.id, details.checked === true)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label textStyle="body">{genre.name}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </SimpleGrid>
        ) : (
          <Text color="fg.muted" textStyle="supporting">
            Genre options will appear when this library has enriched titles.
          </Text>
        )}
        <Fieldset.HelperText>Selected genres must all match.</Fieldset.HelperText>
      </Fieldset.Root>

      <SimpleGrid columns={{ base: 1, sm: 2 }} gap="4">
        <Field.Root invalid={invalidYears}>
          <Field.Label>From year</Field.Label>
          <Input
            aria-describedby={invalidYears ? yearErrorId : undefined}
            aria-label="From year"
            colorPalette="brand"
            type="number"
            min={minimumYear}
            max={maximumYear}
            step={1}
            placeholder="Any year"
            value={draft.yearFrom ?? ''}
            onChange={(event) => {
              const yearFrom = toOptionalYear(event.currentTarget.value);
              setDraft((current) => ({ ...current, yearFrom }));
            }}
          />
        </Field.Root>
        <Field.Root invalid={invalidYears}>
          <Field.Label>Through year</Field.Label>
          <Input
            aria-describedby={invalidYears ? yearErrorId : undefined}
            aria-label="Through year"
            colorPalette="brand"
            type="number"
            min={minimumYear}
            max={maximumYear}
            step={1}
            placeholder="Any year"
            value={draft.yearTo ?? ''}
            onChange={(event) => {
              const yearTo = toOptionalYear(event.currentTarget.value);
              setDraft((current) => ({ ...current, yearTo }));
            }}
          />
          {invalidYears && (
            <Field.ErrorText id={yearErrorId}>
              Use whole years from {minimumYear} through {maximumYear}, with the through year last.
            </Field.ErrorText>
          )}
        </Field.Root>
      </SimpleGrid>

      {supportsPersonalRating && (
        <Field.Root>
          <Field.Label>Personal rating</Field.Label>
          <NativeSelect.Root colorPalette="brand">
            <NativeSelect.Field
              aria-label="Personal rating"
              value={draft.rating}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setDraft((current) => ({
                  ...current,
                  rating:
                    value === 'any' || value === 'rated' || value === 'unrated'
                      ? value
                      : (Number(value) as OwnerMediaRatingFilter),
                }));
              }}
            >
              <option value="any">Any rating</option>
              <option value="rated">Rated</option>
              <option value="unrated">Not rated</option>
              {Array.from({ length: 10 }, (_, index) => 10 - index).map((rating) => (
                <option key={rating} value={rating}>
                  At least {rating / 2} stars
                </option>
              ))}
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      )}
    </Stack>
  );

  return (
    <Stack gap="1.5" w={{ lg: 'auto' }}>
      <Text textStyle="compactLabel">More filters</Text>
      {useDesktopPopover ? (
        <Popover.Root
          open={open}
          onOpenChange={(details) => setDialogOpen(details.open)}
          positioning={{ placement: 'bottom-end' }}
        >
          <Popover.Trigger asChild>{trigger}</Popover.Trigger>
          <Portal>
            <Popover.Positioner>
              <Popover.Content
                data-filter-presentation="desktop"
                maxW="lg"
                maxH="min(44rem, 80dvh)"
                overflow="hidden"
              >
                <Popover.Header>
                  <Popover.Title textStyle="sectionTitle">Filter your library</Popover.Title>
                </Popover.Header>
                <Popover.Body overflowY="auto">{filterFields}</Popover.Body>
                <Popover.Footer>{footer}</Popover.Footer>
                <Popover.CloseTrigger asChild>
                  <CloseButton size="sm" />
                </Popover.CloseTrigger>
              </Popover.Content>
            </Popover.Positioner>
          </Portal>
        </Popover.Root>
      ) : (
        <SimpleDialog
          open={open}
          onOpenChange={(details) => setDialogOpen(details.open)}
          placement="center"
          size="full"
          title="Filter your library"
          closeButton
          footer={footer}
          contentProps={{ borderRadius: '0', h: '100dvh', minH: '100dvh', maxH: '100dvh' }}
          bodyProps={{ overflowY: 'auto' }}
          trigger={trigger}
        >
          {filterFields}
        </SimpleDialog>
      )}
    </Stack>
  );
};

export default MediaLibraryFilters;
