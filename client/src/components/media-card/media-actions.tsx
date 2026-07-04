import { IconButton, VStack } from '@chakra-ui/react';
import type { IconButtonProps } from '@chakra-ui/react';
import { LuBookmark, LuBookmarkPlus, LuCheck, LuEye, LuHeart, LuPlus } from 'react-icons/lu';
import useAddToWatchList from '@/features/user-media/api/use-add-to-watch-list';
import useAddToWatched from '@/features/user-media/api/use-add-to-watched';
import useAddToLiked from '@/features/user-media/api/use-add-to-liked';
import getUserMediaPayload from '@/features/user-media/utils/get-user-media-payload';
import { ReactNode, useState } from 'react';
import AddToCollectionDialog from '@/features/collections/components/add-to-collection-dialog';
import { Tooltip } from '@/components/ui/tooltip';
import { getMediaActionLabel } from '@/features/user-media/utils/media-action-copy';
import { MediaCardModel } from '@/features/media/media-card-model';

interface MediaActionsProps {
  media: MediaCardModel;
}

interface MediaActionIconButtonProps {
  label: string;
  colorPalette: IconButtonProps['colorPalette'];
  loading?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const MediaActionIconButton = ({ label, colorPalette, loading, onClick, children }: MediaActionIconButtonProps) => (
  <Tooltip content={label} showArrow>
    <IconButton
      aria-label={label}
      title={label}
      variant="subtle"
      borderRadius="full"
      colorPalette={colorPalette}
      onClick={onClick}
      loading={loading}
    >
      {children}
    </IconButton>
  </Tooltip>
);

const MediaActions: React.FC<MediaActionsProps> = ({ media }) => {
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false);

  const { mutateAsync: addToWatchList, isPending: isAddingToWatchList } = useAddToWatchList();
  const { mutateAsync: addToWatched, isPending: isAddingToWatched } = useAddToWatched();
  const { mutateAsync: addToLiked, isPending: isAddingToLiked } = useAddToLiked();
  const likeLabel = getMediaActionLabel('liked', Boolean(media.liked));
  const watchedLabel = getMediaActionLabel('watched', Boolean(media.watched));
  const watchlistLabel = getMediaActionLabel('watchlist', Boolean(media.watchlist));
  const collectionLabel = 'Add to collection';
  const collectionMedia = getUserMediaPayload(media);

  const handleWatchlist = async () => {
    if (isAddingToWatchList) return;

    const payload = getUserMediaPayload(media, 'watchlist');

    await addToWatchList(payload);
  };

  const handleWatched = async () => {
    if (isAddingToWatched) return;

    const payload = getUserMediaPayload(media, 'watched');

    await addToWatched(payload);
  };

  const handleLike = async () => {
    if (isAddingToLiked) return;

    const payload = getUserMediaPayload(media, 'liked');

    await addToLiked(payload);
  };

  const handleCollection = () => {
    setShowAddToCollectionDialog(true);
  };

  return (
    <>
      <AddToCollectionDialog
        media={collectionMedia}
        open={showAddToCollectionDialog}
        onOpenChange={setShowAddToCollectionDialog}
      />

      <VStack gap={1} backdropFilter="blur(10px)" p={1} borderRadius="full">
        <MediaActionIconButton label={likeLabel} colorPalette="red" onClick={handleLike} loading={isAddingToLiked}>
          <LuHeart fill={media.liked ? 'red' : 'none'} />
        </MediaActionIconButton>

        <MediaActionIconButton
          label={watchedLabel}
          colorPalette="blue"
          onClick={handleWatched}
          loading={isAddingToWatched}
        >
          {media.watched ? <LuCheck fill="blue" /> : <LuEye />}
        </MediaActionIconButton>

        <MediaActionIconButton
          label={watchlistLabel}
          colorPalette="green"
          onClick={handleWatchlist}
          loading={isAddingToWatchList}
        >
          {media.watchlist ? <LuBookmark fill="green" /> : <LuBookmarkPlus />}
        </MediaActionIconButton>

        <MediaActionIconButton label={collectionLabel} colorPalette="brand" onClick={handleCollection}>
          <LuPlus />
        </MediaActionIconButton>
      </VStack>
    </>
  );
};

export default MediaActions;
