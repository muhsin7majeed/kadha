import { SegmentGroup } from '@chakra-ui/react';

import type { MediaType } from '@/types/common';

export type MediaTypeSegmentValue = 'all' | MediaType;

interface MediaTypeSegmentedControlProps {
  'aria-label': string;
  disabled?: boolean;
  onValueChange: (value: MediaTypeSegmentValue) => void;
  stretch?: boolean;
  value: MediaTypeSegmentValue;
}

const mediaTypeItems = [
  { label: 'All', value: 'all' },
  { label: 'Movies', value: 'movie' },
  { label: 'TV', value: 'tv' },
] satisfies Array<{ label: string; value: MediaTypeSegmentValue }>;

const MediaTypeSegmentedControl = ({
  'aria-label': ariaLabel,
  disabled,
  onValueChange,
  stretch = false,
  value,
}: MediaTypeSegmentedControlProps) => (
  <SegmentGroup.Root
    aria-label={ariaLabel}
    bg="bg"
    borderColor="border"
    borderRadius="l2"
    borderWidth="1px"
    colorPalette="brand"
    css={{ '--segment-indicator-bg': 'var(--chakra-colors-color-palette-solid)' }}
    disabled={disabled}
    size="sm"
    value={value}
    w={stretch ? 'full' : { base: 'full', sm: 'auto' }}
    onValueChange={(details) => onValueChange(details.value as MediaTypeSegmentValue)}
  >
    <SegmentGroup.Indicator />
    <SegmentGroup.Items
      color="fg"
      flex={stretch ? '1' : undefined}
      items={mediaTypeItems}
      _checked={{ bg: 'colorPalette.solid', color: 'colorPalette.contrast' }}
    />
  </SegmentGroup.Root>
);

export default MediaTypeSegmentedControl;
