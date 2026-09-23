import { Field, Flex, NativeSelect } from '@chakra-ui/react';

import MediaTypeSegmentedControl from '@/components/media-type-segmented-control';
import type { MediaType } from '@/types/common';

export type DiaryMediaType = 'all' | MediaType;

interface DiaryFiltersProps {
  availableYears: number[];
  disabled?: boolean;
  mediaType: DiaryMediaType;
  month?: number;
  onMediaTypeChange: (value: DiaryMediaType) => void;
  onMonthChange: (value: number | undefined) => void;
  onYearChange: (value: number | undefined) => void;
  showMonth?: boolean;
  year?: number;
}

const months = Array.from({ length: 12 }, (_, index) => ({
  value: index + 1,
  label: new Intl.DateTimeFormat(undefined, { month: 'long', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2024, index, 1)),
  ),
}));

const DiaryFilters = ({
  availableYears,
  disabled,
  mediaType,
  month,
  onMediaTypeChange,
  onMonthChange,
  onYearChange,
  showMonth = false,
  year,
}: DiaryFiltersProps) => (
  <Flex gap="3" align={{ base: 'stretch', md: 'end' }} direction={{ base: 'column', md: 'row' }} flexWrap="wrap">
    <Field.Root maxW={{ md: 'xs' }}>
      <Field.Label>Media type</Field.Label>
      <MediaTypeSegmentedControl
        aria-label="Filter diary by media type"
        value={mediaType}
        onValueChange={onMediaTypeChange}
        disabled={disabled}
      />
    </Field.Root>

    <Field.Root maxW={{ md: '44' }}>
      <Field.Label>Year</Field.Label>
      <NativeSelect.Root disabled={disabled}>
        <NativeSelect.Field
          aria-label="Filter diary by year"
          value={year ?? ''}
          onChange={(event) => onYearChange(event.currentTarget.value ? Number(event.currentTarget.value) : undefined)}
        >
          <option value="">All years</option>
          {availableYears.map((availableYear) => (
            <option key={availableYear} value={availableYear}>
              {availableYear}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>
    </Field.Root>

    {showMonth && (
      <Field.Root maxW={{ md: '52' }}>
        <Field.Label>Month</Field.Label>
        <NativeSelect.Root disabled={disabled || year === undefined}>
          <NativeSelect.Field
            aria-label="Filter diary by month"
            value={month ?? ''}
            onChange={(event) => onMonthChange(event.currentTarget.value ? Number(event.currentTarget.value) : undefined)}
          >
            <option value="">All months</option>
            {months.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
    )}
  </Flex>
);

export default DiaryFilters;
