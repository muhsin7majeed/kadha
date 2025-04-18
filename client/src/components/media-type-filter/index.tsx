import { useMediaType } from '@/atoms/mediaType';
import { SegmentGroup, SegmentGroupRootProps } from '@chakra-ui/react';
import { MediaType } from '@/types/media';

const FILTER_OPTIONS = ['All', 'Movie', 'TV'];

interface MediaTypeFilterProps {
  chakraProps?: SegmentGroupRootProps;
}

const MediaTypeFilter = ({ chakraProps }: MediaTypeFilterProps) => {
  const [mediaType, setMediaType] = useMediaType();

  const handleMediaTypeChange = (value: MediaType) => {
    setMediaType(value);
  };

  return (
    <SegmentGroup.Root
      value={mediaType}
      onValueChange={(e) => handleMediaTypeChange(e.value as MediaType)}
      {...chakraProps}
    >
      <SegmentGroup.Indicator />
      <SegmentGroup.Items items={FILTER_OPTIONS} />
    </SegmentGroup.Root>
  );
};

export default MediaTypeFilter;
