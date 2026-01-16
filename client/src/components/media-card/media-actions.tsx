import { VStack } from '@chakra-ui/react';
import { LuBookmark, LuBookmarkPlus, LuCheck, LuEye } from 'react-icons/lu';
import { LuHeart } from 'react-icons/lu';
import { IconButton } from '@chakra-ui/react';
import { Media } from '@/types/media';
import useAddToWatchList from './apis/useAddToWatchList';
import useAddToWatched from './apis/useAddToWatched';
import useAddToLiked from './apis/useAddToLiked';
import getUserMediaPayload from './get-user-media-payload';

interface MediaActionsProps {
  media: Media;
}

const MediaActions: React.FC<MediaActionsProps> = ({ media }) => {
  const { mutate: addToWatchList, isPending: isAddingToWatchList } = useAddToWatchList();
  const { mutate: addToWatched, isPending: isAddingToWatched } = useAddToWatched();
  const { mutate: addToLiked, isPending: isAddingToLiked } = useAddToLiked();

  const handleWatchlist = () => {
    if (isAddingToWatchList) return;

    const payload = getUserMediaPayload(media, 'watchlist');

    addToWatchList(payload);
  };

  const handleWatched = () => {
    if (isAddingToWatched) return;

    const payload = getUserMediaPayload(media, 'watched');

    addToWatched(payload);
  };

  const handleLike = () => {
    if (isAddingToLiked) return;

    const payload = getUserMediaPayload(media, 'liked');

    addToLiked(payload);
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
