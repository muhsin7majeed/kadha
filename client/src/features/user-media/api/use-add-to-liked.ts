import useMediaActionMutation, { MediaActionMutationBehavior } from './use-media-action-mutation';

const useAddToLiked = (behavior?: MediaActionMutationBehavior) =>
  useMediaActionMutation({
    action: 'liked',
    endpoint: '/api/user-media/liked',
    behavior,
  });

export default useAddToLiked;
