import MediaListView from '@/components/media-list-view';
import { userMediaToMediaCardModel } from '@/features/media/media-card-model';
import type { OwnerMediaLibraryKey, UserMedia } from '@/features/user-media/user-media.types';
import { getOwnerLibraryMeta, getOwnerMediaDate } from './owner-media-view-utils';

interface OwnerMediaListViewProps {
  data: UserMedia[];
  libraryKey: OwnerMediaLibraryKey;
  showPersonalRating: boolean;
}

const OwnerMediaListView = ({ data, libraryKey, showPersonalRating }: OwnerMediaListViewProps) => {
  const { dateLabel } = getOwnerLibraryMeta(libraryKey);

  return (
    <MediaListView
      data={data.map((media) => ({
        media: userMediaToMediaCardModel(media),
        contextualDate: { label: dateLabel, value: getOwnerMediaDate(media, libraryKey) },
      }))}
      showPersonalRating={showPersonalRating}
    />
  );
};

export default OwnerMediaListView;
