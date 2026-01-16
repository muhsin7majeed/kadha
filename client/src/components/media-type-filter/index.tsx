import { useMediaType } from '@/atoms/mediaType';
import { SegmentGroup, SegmentGroupRootProps } from '@chakra-ui/react';
import type { MediaTypeFilter } from '@/types/common';
import MEDIA from '@/constants/media';

interface MediaTypeFilterProps {
  chakraProps?: SegmentGroupRootProps;
}

const MediaTypeFilter = ({ chakraProps }: MediaTypeFilterProps) => {
  const [mediaType, setMediaType] = useMediaType();

  const handleMediaTypeChange = (value: MediaTypeFilter) => {
    setMediaType(value);
  };

  return (
    <SegmentGroup.Root
      value={mediaType}
      onValueChange={(e) => handleMediaTypeChange(e.value as MediaTypeFilter)}
      {...chakraProps}
    >
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={Object.values(MEDIA.MEDIA_TYPE_FILTER)} />
    </SegmentGroup.Root>
  );
};

export default MediaTypeFilter;
