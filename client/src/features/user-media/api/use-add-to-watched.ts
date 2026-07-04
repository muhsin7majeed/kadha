import useMediaActionMutation from './use-media-action-mutation';

const useAddToWatched = () =>
  useMediaActionMutation({
    action: 'watched',
    endpoint: '/api/user-media/watched',
  });

export default useAddToWatched;
