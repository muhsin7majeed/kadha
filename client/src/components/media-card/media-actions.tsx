import { IconButton, VStack } from '@chakra-ui/react';
import type { IconButtonProps } from '@chakra-ui/react';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { LuBookmark, LuBookmarkPlus, LuCheck, LuEye, LuHeart, LuPlus } from 'react-icons/lu';

import { Tooltip } from '@/components/ui/tooltip';
import AddToCollectionDialog from '@/features/collections/components/add-to-collection-dialog';
import { MediaCardModel } from '@/features/media/media-card-model';
import useAddToWatchList from '@/features/user-media/api/use-add-to-watch-list';
import useAddToWatched from '@/features/user-media/api/use-add-to-watched';
import useAddToLiked from '@/features/user-media/api/use-add-to-liked';
import MediaTrackingDetailsDialog from '@/features/user-media/components/media-tracking-details-dialog';
import MediaTrackingDialog from '@/features/user-media/components/media-tracking-dialog';
import MovieWatchHistoryDialog from '@/features/user-media/components/movie-watch-history-dialog';
import WatchEventDialog from '@/features/user-media/components/watch-event-dialog';
import type { MediaAction, UserMediaPayload } from '@/features/user-media/user-media.types';
import buildUserMediaPayload from '@/features/user-media/utils/build-user-media-payload';
import { getMediaActionLabel } from '@/features/user-media/utils/media-action-copy';
import type { MediaTrackingDetailsUpdate } from '@/features/user-media/utils/media-tracking-details';

interface MediaActionsProps {
  media: MediaCardModel;
  size?: IconButtonProps['size'];
}

interface MediaActionIconButtonProps {
  label: string;
  colorPalette: IconButtonProps['colorPalette'];
  size?: IconButtonProps['size'];
  loading?: boolean;
  onClick: () => void;
  children: ReactNode;
}

const MediaActionIconButton = ({
  label,
  colorPalette,
  size,
  loading,
  onClick,
  children,
}: MediaActionIconButtonProps) => (
  <Tooltip content={label} showArrow>
    <IconButton
      aria-label={label}
      title={label}
      size={size}
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

const MediaActions: React.FC<MediaActionsProps> = ({ media, size = 'md' }) => {
  const [showAddToCollectionDialog, setShowAddToCollectionDialog] = useState(false);
  const [trackingDetailsOpen, setTrackingDetailsOpen] = useState(false);
  const [watchHistoryOpen, setWatchHistoryOpen] = useState(false);
  const [watchEventOpen, setWatchEventOpen] = useState(false);
  const [savedDetails, setSavedDetails] = useState<MediaTrackingDetailsUpdate>({});
  const [trackingDialog, setTrackingDialog] = useState<{
    action: MediaAction;
    media: UserMediaPayload;
  } | null>(null);
  const getDetailsToastAction = (action: MediaAction, label: string) => (payload: UserMediaPayload) =>
    payload[action]
      ? {
          label,
          onClick: () => setTrackingDialog({ action, media: payload }),
        }
      : undefined;

  const { mutateAsync: addToWatchList, isPending: isAddingToWatchList } = useAddToWatchList({
    getToastAction: getDetailsToastAction('watchlist', 'Add note'),
  });
  const { mutateAsync: addToWatched, isPending: isAddingToWatched } = useAddToWatched({
    getToastAction: getDetailsToastAction('watched', 'Add details'),
  });
  const { mutateAsync: addToLiked, isPending: isAddingToLiked } = useAddToLiked({
    getToastAction: getDetailsToastAction('liked', 'Add details'),
  });
  const likeLabel = getMediaActionLabel('liked', Boolean(media.liked));
  const watchedLabel =
    media.media_type === 'movie'
      ? media.watchCount || media.watched
        ? 'Manage watch history'
        : 'Mark watched'
      : media.watched
        ? 'Manage watched tracking'
        : getMediaActionLabel('watched', false);
  const watchlistLabel = getMediaActionLabel('watchlist', Boolean(media.watchlist));
  const collectionLabel = 'Add to collection';
  const currentMedia = useMemo(() => ({ ...media, ...savedDetails }), [media, savedDetails]);
  const mediaPayload = useMemo(() => buildUserMediaPayload(currentMedia), [currentMedia]);

  useEffect(() => {
    setSavedDetails({});
  }, [media.media_id, media.media_type]);

  const handleWatchlist = async () => {
    if (isAddingToWatchList) return;

    const payload = buildUserMediaPayload(currentMedia, 'watchlist');

    await addToWatchList(payload);
  };

  const handleWatched = async () => {
    if (isAddingToWatched) return;

    if (media.media_type === 'movie') {
      if (media.watchCount || media.watched) {
        setWatchHistoryOpen(true);
      } else {
        setWatchEventOpen(true);
      }
      return;
    }

    if (media.watched) {
      setTrackingDetailsOpen(true);
      return;
    }

    const payload = buildUserMediaPayload(currentMedia, 'watched');

    await addToWatched(payload);
  };

  const handleLike = async () => {
    if (isAddingToLiked) return;

    const payload = buildUserMediaPayload(currentMedia, 'liked');

    await addToLiked(payload);
  };

  const handleCollection = () => {
    setShowAddToCollectionDialog(true);
  };

  return (
    <>
      <AddToCollectionDialog
        media={mediaPayload}
        open={showAddToCollectionDialog}
        onOpenChange={setShowAddToCollectionDialog}
      />
      {trackingDialog && (
        <MediaTrackingDialog
          action={trackingDialog.action}
          context="card-post-action"
          media={{ ...trackingDialog.media, ...savedDetails }}
          currentState={{ ...currentMedia, ...trackingDialog.media }}
          open
          onSaved={(details) => setSavedDetails((current) => ({ ...current, ...details }))}
          onOpenChange={(open) => {
            if (!open) {
              setTrackingDialog(null);
            }
          }}
        />
      )}
      {media.media_type === 'movie' && (
        <>
          <WatchEventDialog media={mediaPayload} open={watchEventOpen} onOpenChange={setWatchEventOpen} />
          <MovieWatchHistoryDialog media={mediaPayload} open={watchHistoryOpen} onOpenChange={setWatchHistoryOpen} />
        </>
      )}

      <VStack gap={{ base: 0.5, md: 1 }} backdropFilter="blur(10px)" p={{ base: 0.5, md: 1 }} borderRadius="full">
        <MediaActionIconButton
          label={likeLabel}
          colorPalette="red"
          size={size}
          onClick={handleLike}
          loading={isAddingToLiked}
        >
          <LuHeart fill={media.liked ? 'red' : 'none'} />
        </MediaActionIconButton>

        <MediaActionIconButton
          label={watchedLabel}
          colorPalette="blue"
          size={size}
          onClick={handleWatched}
          loading={media.media_type === 'tv' && isAddingToWatched}
        >
          {media.watched || Boolean(media.watchCount) ? (
            <LuCheck fill="blue" />
          ) : (
            <LuEye />
          )}
        </MediaActionIconButton>

        <MediaActionIconButton
          label={watchlistLabel}
          colorPalette="green"
          size={size}
          onClick={handleWatchlist}
          loading={isAddingToWatchList}
        >
          {media.watchlist ? <LuBookmark fill="green" /> : <LuBookmarkPlus />}
        </MediaActionIconButton>

        <MediaTrackingDetailsDialog
          excludedActions={media.media_type === 'movie' ? ['watched'] : []}
          media={mediaPayload}
          trackingState={media}
          size={size}
          open={trackingDetailsOpen}
          onOpenChange={setTrackingDetailsOpen}
          onSaved={(details) => setSavedDetails((current) => ({ ...current, ...details }))}
        />

        <MediaActionIconButton label={collectionLabel} colorPalette="brand" size={size} onClick={handleCollection}>
          <LuPlus />
        </MediaActionIconButton>
      </VStack>
    </>
  );
};

export default MediaActions;
