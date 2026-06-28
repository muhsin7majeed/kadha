import MediaListPage from '@/components/media-list-page';
import { LuSearch } from 'react-icons/lu';
import useSearchMedia from '@/features/media/api/use-search-media';
import { useEffect, useState } from 'react';

interface MediaSearchResultsProps {
  searchQuery: string;
}

const MediaSearchResults: React.FC<MediaSearchResultsProps> = ({ searchQuery }) => {
  const [page, setPage] = useState(1);
  const { data: results, isLoading, isFetching, error, refetch } = useSearchMedia(searchQuery, page);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  return (
    <>
      <MediaListPage
        title="Movies and tv shows"
        description={`Found ${results?.pagination.total ?? 0} results for "${searchQuery}"`}
        data={results?.data}
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
        pagination={results?.pagination}
        onPageChange={setPage}
      />
    </>
  );
};

export default MediaSearchResults;
