import useMediaActionMutation from './use-media-action-mutation';

const useAddToLiked = () =>
  useMediaActionMutation({
    action: 'liked',
    endpoint: '/api/user-media/liked',
  });

export default useAddToLiked;
