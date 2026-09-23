import MediaTableView from '@/components/media-table-view';
import { userMediaToMediaCardModel } from '@/features/media/media-card-model';
import type { OwnerMediaLibraryKey, UserMedia } from '@/features/user-media/user-media.types';
import { getOwnerLibraryMeta, getOwnerMediaDate } from './owner-media-view-utils';

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

const OwnerMediaTableView = ({ data, libraryKey, showPersonalRating }: OwnerMediaTableViewProps) => {
  const { dateLabel, tableLabel } = getOwnerLibraryMeta(libraryKey);

  return (
    <MediaTableView
      ariaLabel={`${libraryNames[libraryKey]} library table`}
      contextualDateLabel={tableLabel}
      data={data.map((media) => ({
        media: userMediaToMediaCardModel(media),
        contextualDate: { label: dateLabel, value: getOwnerMediaDate(media, libraryKey) },
      }))}
      minW="56rem"
      scrollTestId="owner-library-table-scroll"
      showPersonalRating={showPersonalRating}
    />
  );
};

export default OwnerMediaTableView;
