import PageHeader from '@/components/page-header';
import useCollections from './apis/use-collections';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import EmptyState from '@/components/info-states/empty-state';
import { Accordion } from '@chakra-ui/react';
import CollectionItem from './collection-item';
import { useState } from 'react';

const Collections = () => {
  const [openedCollections, setOpenedCollections] = useState<string[]>([]);

  const { data: collections, isLoading, isFetching, error, refetch } = useCollections();

  return (
    <>
      <PageHeader isFetching={isFetching} mb="4">
        Collections
      </PageHeader>

      {isLoading ? (
        <CommonSpinner />
      ) : error ? (
        <ErrorState title="Error" description="Error fetching collections" onRetry={refetch} />
      ) : collections?.length === 0 ? (
        <EmptyState title="No collections" description="No collections found" />
      ) : (
        <>
          {/* 
              TODO: This seems to be re-rendering entire accoridans on each item open/close
              Need a better solution. Might have to resort to regular cards view.
              Each card item add-t-watch-list action is also re-rendering the entire accordian for some reason.
        */}
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
        </>
      )}
    </>
  );
};

export default Collections;
