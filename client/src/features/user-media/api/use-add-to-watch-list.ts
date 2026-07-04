import useMediaActionMutation from './use-media-action-mutation';

const useAddToWatchList = () =>
  useMediaActionMutation({
    action: 'watchlist',
    endpoint: '/api/user-media/watchlist',
  });

export default useAddToWatchList;
