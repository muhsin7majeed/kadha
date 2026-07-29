import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import SimpleDialog from '@/components/dialogs/simple-dialog';
import SimpleAvatar from '@/components/simple-avatar';
import { Collection, CollectionDetails } from '@/features/collections/collections.types';
import useCollection from '@/features/collections/api/use-collection';
import { useGetMe } from '@/features/user/api/use-get-me';
import { toCollectionMemberRowUser } from '@/features/collections/utils/collection-members';
import CollectionMemberRow from './collection-member-row';
import CollectionSharingDialog from './collection-menu/collection-sharing-dialog';

interface CollectionMembersDialogProps {
  collection: Collection | CollectionDetails;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  trigger?: React.ReactNode;
}

const visibleMembersCount = 5;

const hasCollectionDetails = (collection: Collection | CollectionDetails): collection is CollectionDetails => {
  return Array.isArray(collection.members) && !!collection.owner && !!collection.access;
};

const CollectionMembersDialog: React.FC<CollectionMembersDialogProps> = ({
  collection,
  onOpenChange,
  open,
  trigger,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const canManageSharing = collection.access?.canManageSharing === true;
  const collectionQuery = useCollection({
    collectionId: collection.id,
    enabled: isOpen && !canManageSharing && !hasCollectionDetails(collection),
  });
  const collectionData = hasCollectionDetails(collection) ? collection : collectionQuery.data;
  const { data: currentUser } = useGetMe({ enabled: isOpen });
  const members = collectionData?.members ?? [];
  const visibleMembers = members.slice(0, visibleMembersCount - 1);
  const hiddenMembersCount = Math.max(members.length - visibleMembers.length, 0);
  const defaultTrigger = collectionData ? (
    <Button variant="ghost" colorPalette="gray" h="auto" p="1" justifyContent="flex-start">
      <HStack gap="2" flexWrap="wrap">
        <SimpleAvatar fallbackName={collectionData.owner.username} size="sm" />

        {visibleMembers.map((member) => (
          <SimpleAvatar key={member.id} fallbackName={member.user.username} size="sm" />
        ))}

        {hiddenMembersCount > 0 && (
          <Badge variant="surface" borderRadius="full">
            +{hiddenMembersCount}
          </Badge>
        )}

        <Text as="span" color="fg.muted" textStyle="supporting">
          {collectionData.memberCount} members
        </Text>
      </HStack>
    </Button>
  ) : (
    <Button variant="ghost" colorPalette="gray" h="auto" p="1" justifyContent="flex-start">
      Members
    </Button>
  );
  const triggerNode = trigger ?? (open === undefined ? defaultTrigger : undefined);

  const handleOpenChange = (nextOpen: boolean) => {
    setInternalOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <SimpleDialog
      open={isOpen}
      title="Collection members"
      closeButton
      onOpenChange={(event) => handleOpenChange(event.open)}
      trigger={triggerNode}
    >
      {canManageSharing ? (
        <CollectionSharingDialog collection={collection} open={isOpen} />
      ) : collectionQuery.isLoading ? (
        <CommonSpinner />
      ) : collectionQuery.isError ? (
        <ErrorState title="Error" description="Error loading members" onRetry={collectionQuery.refetch} />
      ) : collectionData ? (
        <Stack gap={{ base: 3, md: 4 }}>
          <Box>
            <Text fontWeight="medium">{collectionData.name}</Text>
            <Text color="fg.muted" textStyle="supporting">
              People with access to this collection
            </Text>
          </Box>

          <Stack gap="2">
            <CollectionMemberRow
              collectionId={collectionData.id}
              currentUserId={currentUser?.id}
              currentUserAccess={collectionData.access}
              mode="view"
              user={{ ...collectionData.owner, role: 'owner' }}
            />

            {members.map((member) => (
              <CollectionMemberRow
                key={member.id}
                collectionId={collectionData.id}
                currentUserId={currentUser?.id}
                currentUserAccess={collectionData.access}
                mode="view"
                user={toCollectionMemberRowUser(member)}
              />
            ))}
          </Stack>
        </Stack>
      ) : null}
    </SimpleDialog>
  );
};

export default CollectionMembersDialog;
