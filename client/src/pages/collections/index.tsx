import PageHeader from '@/components/page-header';
import useCollections from '@/features/collections/api/use-collections';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import { Accordion, Flex } from '@chakra-ui/react';
import CollectionItem from './collection-item';
import { useState } from 'react';
import CreateCollectionButton from '@/features/collections/components/create-collection-button';
import SimpleTabs from '@/components/simple-tabs';
import { CollectionScope } from '@/features/collections/collections.types';

const Collections = () => {
  const [openedCollections, setOpenedCollections] = useState<string[]>([]);
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
          isFetching={isFetching}
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
        onValueChange={(value) => {
          setScope(value as CollectionScope);
          setOpenedCollections([]);
        }}
      />

      {isLoading ? (
        <CommonSpinner />
      ) : error ? (
        <ErrorState title="Error" description="Error fetching collections" onRetry={refetch} />
      ) : collections?.length === 0 ? (
        <EmptyState title={emptyStateByScope[scope].title} description={emptyStateByScope[scope].description} />
      ) : (
        <Accordion.Root
          spaceY="6"
          variant="plain"
          collapsible
          size="lg"
          value={openedCollections}
          onValueChange={(e) => {
            setOpenedCollections(e.value);
          }}
        >
          {collections?.map((collection, index) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              index={index}
              isOpened={openedCollections.includes(collection.id)}
            />
          ))}
        </Accordion.Root>
      )}
    </>
  );
};

export default Collections;
