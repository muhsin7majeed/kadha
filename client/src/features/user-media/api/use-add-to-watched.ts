import useMediaActionMutation, { MediaActionMutationBehavior } from './use-media-action-mutation';

const useAddToWatched = (behavior?: MediaActionMutationBehavior) =>
  useMediaActionMutation({
    action: 'watched',
    endpoint: '/api/user-media/watched',
    behavior,
  });

export default useAddToWatched;
