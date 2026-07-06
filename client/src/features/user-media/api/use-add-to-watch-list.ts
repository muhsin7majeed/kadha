import useMediaActionMutation, { MediaActionMutationBehavior } from './use-media-action-mutation';

const useAddToWatchList = (behavior?: MediaActionMutationBehavior) =>
  useMediaActionMutation({
    action: 'watchlist',
    endpoint: '/api/user-media/watchlist',
    behavior,
  });

export default useAddToWatchList;
