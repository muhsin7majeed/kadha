import MediaListPage from '@/components/media-list-page';
import { LuSearch } from 'react-icons/lu';
import useSearchMedia from './apis/use-search-media';

interface MediaSearchResultsProps {
  searchQuery: string;
}

const MediaSearchResults: React.FC<MediaSearchResultsProps> = ({ searchQuery }) => {
  const { data: results, isLoading, isFetching, error, refetch } = useSearchMedia(searchQuery);

  return (
    <>
      <MediaListPage
        title="Movies and tv shows"
        description={`Found ${results?.length} results for "${searchQuery}"`}
        data={results}
        isLoading={isLoading}
        isFetching={isFetching}
        error={error}
        refetch={refetch}
        emptyState={{
          title: 'No results found',
          description: 'Try searching for a different movie or show.',
          icon: <LuSearch />,
        }}
        errorDescription="Failed to fetch movies and tv shows"
        loadingText="Loading movies and tv shows..."
        spinnerColor="orange"
      />
    </>
  );
};

export default MediaSearchResults;
