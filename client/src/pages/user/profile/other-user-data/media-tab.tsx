import EmptyState from '@/components/info-states/empty-state';
import MediaListPage from '@/components/media-list-page';
import useLiked from '@/features/user-media/api/use-liked';
import useWatched from '@/features/user-media/api/use-watched';
import useWatchList from '@/features/user-media/api/use-watch-list';
import { Box, Text } from '@chakra-ui/react';
import { LuBookmark, LuCheck, LuHeart } from 'react-icons/lu';
import { useParams } from 'react-router';

type MediaTabType = 'watched' | 'liked' | 'watchlist';

interface OtherUserMediaTabProps {
  type: MediaTabType;
}

const meta = {
  watched: {
    title: 'Watched',
    description: 'Movies and shows this user has watched.',
    emptyTitle: 'Nothing watched',
    emptyDescription: 'No visible watched activity yet.',
    errorDescription: 'Failed to fetch watched',
    loadingText: 'Loading watched...',
    icon: <LuCheck />,
    spinnerColor: 'green.500',
  },
  liked: {
    title: 'Liked',
    description: 'Movies and shows this user liked.',
    emptyTitle: 'Nothing liked',
    emptyDescription: 'No visible liked activity yet.',
    errorDescription: 'Failed to fetch liked',
    loadingText: 'Loading liked...',
    icon: <LuHeart />,
    spinnerColor: 'red.500',
  },
  watchlist: {
    title: 'Watchlist',
    description: 'Movies and shows this user plans to watch.',
    emptyTitle: 'Empty watchlist',
    emptyDescription: 'No visible watchlist items yet.',
    errorDescription: 'Failed to fetch watchlist',
    loadingText: 'Loading watchlist...',
    icon: <LuBookmark />,
    spinnerColor: 'orange',
  },
};

const OtherUserMediaTab: React.FC<OtherUserMediaTabProps> = ({ type }) => {
  const { username = '' } = useParams();
  const watched = useWatched(username, { enabled: type === 'watched' });
  const liked = useLiked(username, { enabled: type === 'liked' });
  const watchlist = useWatchList(username, { enabled: type === 'watchlist' });
  const query = type === 'watched' ? watched : type === 'liked' ? liked : watchlist;
  const tabMeta = meta[type];

  if (query.data?.canView === false) {
    return (
      <Box py="10">
        <EmptyState
          title={query.data.lockedReason === 'FRIENDS_ONLY' ? 'Friends only' : 'Private'}
          description="This activity is not visible to you."
        />
      </Box>
    );
  }

  return (
    <Box>
      <Text srOnly>{tabMeta.title}</Text>
      <MediaListPage
        title={tabMeta.title}
        description={tabMeta.description}
        data={query.data?.data}
        isLoading={query.isLoading}
        isFetching={query.isFetching}
        error={query.error}
        refetch={query.refetch}
        emptyState={{
          title: tabMeta.emptyTitle,
          description: tabMeta.emptyDescription,
          icon: tabMeta.icon,
        }}
        errorDescription={tabMeta.errorDescription}
        loadingText={tabMeta.loadingText}
        spinnerColor={tabMeta.spinnerColor}
      />
    </Box>
  );
};

export default OtherUserMediaTab;
