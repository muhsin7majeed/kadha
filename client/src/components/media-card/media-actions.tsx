import { VStack } from '@chakra-ui/react';
import { LuBookmark, LuBookmarkPlus, LuCheck, LuEye } from 'react-icons/lu';
import { LuHeart } from 'react-icons/lu';
import { IconButton } from '@chakra-ui/react';
import { MovieWithMeta, TvWithMeta } from '@/types/media';
import useAddToWatchList from './apis/use-add-to-watch-list';
import useAddToWatched from './apis/use-add-to-watched';
import useAddToLiked from './apis/use-add-to-liked';
import getUserMediaPayload from './get-user-media-payload';

interface MediaActionsProps {
  media: MovieWithMeta | TvWithMeta;
}

const MediaActions: React.FC<MediaActionsProps> = ({ media }) => {
  const { mutateAsync: addToWatchList, isPending: isAddingToWatchList } = useAddToWatchList();
  const { mutateAsync: addToWatched, isPending: isAddingToWatched } = useAddToWatched();
  const { mutateAsync: addToLiked, isPending: isAddingToLiked } = useAddToLiked();

  const handleWatchlist = async () => {
    if (isAddingToWatchList) return;

    const payload = getUserMediaPayload(media, 'watchlist');

    await addToWatchList(payload);

    // TODO: Check if mutation will cause issue
    media.watchlist = !media.watchlist;
  };

  const handleWatched = async () => {
    if (isAddingToWatched) return;

    const payload = getUserMediaPayload(media, 'watched');

    await addToWatched(payload);

    // TODO: Check if mutation will cause issue
    media.watched = !media.watched;
  };

  const handleLike = async () => {
    if (isAddingToLiked) return;

    const payload = getUserMediaPayload(media, 'liked');

    await addToLiked(payload);

    // TODO: Check if mutation will cause issue
    media.liked = !media.liked;
  };

  return (
    <VStack gap={1} backdropFilter="blur(10px)" p={1} borderRadius="full" onClick={(e) => e.preventDefault()}>
      <IconButton
        variant="subtle"
        borderRadius="full"
        colorPalette="red"
        onClick={handleLike}
        loading={isAddingToLiked}
      >
        <LuHeart fill={media.liked ? 'red' : 'none'} />
      </IconButton>

      <IconButton
        variant="subtle"
        borderRadius="full"
        colorPalette="blue"
        onClick={handleWatched}
        loading={isAddingToWatched}
      >
        {media.watched ? <LuCheck fill="blue" /> : <LuEye />}
      </IconButton>

      <IconButton
        variant="subtle"
        borderRadius="full"
        colorPalette="green"
        onClick={handleWatchlist}
        loading={isAddingToWatchList}
      >
        {media.watchlist ? <LuBookmark fill="green" /> : <LuBookmarkPlus />}
      </IconButton>
    </VStack>
  );
};

export default MediaActions;
