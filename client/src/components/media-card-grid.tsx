import { SimpleGrid } from '@chakra-ui/react';

import MediaCard from '@/components/media-card';
import type { MediaCardModel } from '@/features/media/media-card-model';

interface MediaCardGridProps {
  media: MediaCardModel[];
  detailsPathPrefix?: string;
  showActions?: boolean;
  showLibraryMetadata?: boolean;
  showPersonalRating?: boolean;
}

const MediaCardGrid = ({
  media,
  detailsPathPrefix,
  showActions,
  showLibraryMetadata,
  showPersonalRating,
}: MediaCardGridProps) => (
  <SimpleGrid
    data-testid="media-card-grid"
    gridTemplateColumns={{
      base: 'repeat(auto-fit, minmax(min(10rem, 100%), 1fr))',
      sm: 'repeat(2, minmax(0, 1fr))',
      md: 'repeat(3, minmax(0, 1fr))',
      lg: 'repeat(4, minmax(0, 1fr))',
    }}
    gap={{ base: 2, sm: 4, md: 6 }}
    justifyItems="center"
  >
    {media.map((item) => (
      <MediaCard
        key={`${item.media_type}:${item.media_id}`}
        detailsPathPrefix={detailsPathPrefix}
        media={item}
        showActions={showActions}
        showLibraryMetadata={showLibraryMetadata}
        showPersonalRating={showPersonalRating}
        width="100%"
      />
    ))}
  </SimpleGrid>
);

export default MediaCardGrid;
