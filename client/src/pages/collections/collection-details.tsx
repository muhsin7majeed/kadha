import { Badge, Button, Flex, HStack, Stack, Text } from '@chakra-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { LuArrowLeft } from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router';

import ErrorState from '@/components/info-states/error-state';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import useCollection from '@/features/collections/api/use-collection';
import CollectionDetailsContent from '@/features/collections/components/collection-details-content';

import CollectionMenu from '@/features/collections/components/collection-menu';
import {
  clearUnavailableCollection,
  isUnavailableCollectionError,
} from '@/features/collections/utils/collection-query-errors';
import {
  getCollectionAccessLabel,
  getCollectionPrivacyLabel,
  getCollectionSharingLabel,
} from '@/features/collections/utils/collection-sharing';

const CollectionDetailsPage = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handledUnavailable = useRef(false);
  const collection = useCollection({ collectionId: id, enabled: Boolean(id) });
  const unavailable = isUnavailableCollectionError(collection.error);

  useEffect(() => {
    if (!unavailable || handledUnavailable.current) return;
    handledUnavailable.current = true;
    void clearUnavailableCollection(queryClient, id);
  }, [id, queryClient, unavailable]);

  if (collection.isLoading) return <CommonSpinner />;

  if (unavailable) {
    return (
      <Stack gap="4" align="flex-start">
        <Button asChild variant="plain" colorPalette="gray" px="0">
          <Link to="/app/collections">
            <LuArrowLeft /> Back to collections
          </Link>
        </Button>
        <Text role="status" textStyle="body">
          This collection is no longer available. It may have been removed by its owner or your access may have changed.
        </Text>
      </Stack>
    );
  }

  if (collection.isError || !collection.data) {
    return <ErrorState title="Error" description="Error fetching collection" onRetry={collection.refetch} />;
  }

  const details = collection.data;
  const sharingLabel = getCollectionSharingLabel(details);
  const accessLabel = getCollectionAccessLabel(details);

  return (
    <Stack gap="5">
      <Button asChild variant="plain" colorPalette="gray" alignSelf="flex-start" px="0">
        <Link to="/app/collections">
          <LuArrowLeft /> Back to collections
        </Link>
      </Button>

      <Flex justify="space-between" align="flex-start" gap="3">
        <PageHeader isFetching={collection.isFetching} mb="0">
          {details.name}
        </PageHeader>
        <CollectionMenu collection={details} onCollectionUnavailable={() => navigate('/app/collections')} />
      </Flex>

      <HStack gap="2" flexWrap="wrap">
        <Badge variant="surface" colorPalette="gray">
          {details.media.length} {details.media.length === 1 ? 'item' : 'items'}
        </Badge>
        <Badge variant="subtle" colorPalette="gray">
          {getCollectionPrivacyLabel(details.privacy)}
        </Badge>
        {sharingLabel && (
          <Text color="fg.muted" textStyle="supporting">
            {sharingLabel}
          </Text>
        )}
        {accessLabel && (
          <Badge variant="surface" colorPalette="brand">
            {accessLabel}
          </Badge>
        )}
      </HStack>

      <CollectionDetailsContent collection={details} />
    </Stack>
  );
};

export default CollectionDetailsPage;
