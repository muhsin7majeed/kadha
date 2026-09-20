import CommonSpinner from '@/components/spinners/common-spinner';
import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import useUserCollections from '@/features/collections/api/use-user-collections';
import CollectionList from '@/features/collections/components/collection-list';
import { useParams } from 'react-router';

const OtherUserCollectionsTab = () => {
  const { username = '' } = useParams();
  const { data, isLoading, error, refetch } = useUserCollections(username);

  if (isLoading) {
    return <CommonSpinner />;
  }

  if (error) {
    return <ErrorState title="Error" description="Failed to fetch collections" onRetry={refetch} />;
  }

  if (!data?.data.length) {
    return <EmptyState title="No collections" description="No collections found" />;
  }

  return (
    <CollectionList
      collections={data.data}
      getDetailsPath={(collection) => `/share/collections/${collection.id}`}
    />
  );
};

export default OtherUserCollectionsTab;
