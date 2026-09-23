import { Flex } from '@chakra-ui/react';
import { useState } from 'react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import SimpleTabs from '@/components/simple-tabs';
import ListSkeleton from '@/components/loading/list-skeleton';
import useCollections from '@/features/collections/api/use-collections';
import CollectionList from '@/features/collections/components/collection-list';
import CollectionMenu from '@/features/collections/components/collection-menu';
import CreateCollectionButton from '@/features/collections/components/create-collection-button';
import { CollectionScope } from '@/features/collections/collections.types';

const Collections = () => {
  const [scope, setScope] = useState<CollectionScope>('all');
  const { data: collections, isLoading, isFetching, error, refetch } = useCollections({ scope });

  const emptyStateByScope: Record<CollectionScope, { title: string; description: string }> = {
    all: { title: 'No collections', description: 'No collections found' },
    mine: { title: 'No collections', description: 'No collections found' },
    shared: { title: 'No shared collections yet', description: 'No shared collections found' },
  };

  return (
    <>
      <Flex justifyContent="space-between" alignItems="flex-start" direction={{ base: 'column', sm: 'row' }} gap="3" mb="4">
        <PageHeader
          isRefreshing={isFetching && !isLoading && collections !== undefined}
          mb="0"
          subHeader="Create custom groups for movies and shows you want to organize together."
        >
          Collections
        </PageHeader>

        <CreateCollectionButton />
      </Flex>

      <SimpleTabs
        tabs={[
          { value: 'all', label: 'All' },
          { value: 'mine', label: 'Mine' },
          { value: 'shared', label: 'Shared' },
        ]}
        value={scope}
        onValueChange={(value) => setScope(value as CollectionScope)}
      />

      {isLoading ? (
        <ListSkeleton label="Loading collections" />
      ) : error ? (
        <ErrorState title="Error" description="Error fetching collections" onRetry={refetch} />
      ) : collections?.length === 0 ? (
        <EmptyState title={emptyStateByScope[scope].title} description={emptyStateByScope[scope].description} />
      ) : collections ? (
        <CollectionList
          collections={collections}
          getDetailsPath={(collection) => `/app/collections/${collection.id}`}
          showPeople
          renderActions={(collection) =>
            'userId' in collection ? <CollectionMenu collection={collection} /> : null
          }
        />
      ) : null}
    </>
  );
};

export default Collections;
