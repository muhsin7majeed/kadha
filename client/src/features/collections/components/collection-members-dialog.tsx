import { Badge, Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import SimpleDialog from '@/components/dialogs/simple-dialog';
import SimpleAvatar from '@/components/simple-avatar';
import { CollectionDetails } from '@/features/collections/collections.types';
import { useGetMe } from '@/features/user/api/use-get-me';
import { toCollectionMemberRowUser } from '@/features/collections/utils/collection-members';
import CollectionMemberRow from './collection-member-row';

interface CollectionMembersDialogProps {
  collection: CollectionDetails;
}

const visibleMembersCount = 5;

const CollectionMembersDialog: React.FC<CollectionMembersDialogProps> = ({ collection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: currentUser } = useGetMe({ enabled: isOpen });
  const members = collection.members;
  const visibleMembers = members.slice(0, visibleMembersCount - 1);
  const hiddenMembersCount = Math.max(members.length - visibleMembers.length, 0);

  return (
    <SimpleDialog
      open={isOpen}
      title="Collection Members"
      closeButton
      contentProps={{ maxW: { base: 'calc(100vw - 2rem)', md: '2xl' } }}
      onOpenChange={(event) => setIsOpen(event.open)}
      trigger={
        <Button variant="ghost" h="auto" p="1" justifyContent="flex-start">
          <HStack gap="2" flexWrap="wrap">
            <SimpleAvatar fallbackName={collection.owner.username} size="sm" />

            {visibleMembers.map((member) => (
              <SimpleAvatar key={member.id} fallbackName={member.user.username} size="sm" />
            ))}

            {hiddenMembersCount > 0 && (
              <Badge variant="surface" borderRadius="full">
                +{hiddenMembersCount}
              </Badge>
            )}

            <Text as="span" color="fg.muted" fontSize="sm">
              {collection.memberCount} members
            </Text>
          </HStack>
        </Button>
      }
    >
      <Stack gap="4">
        <Box>
          <Text fontWeight="medium">{collection.name}</Text>
          <Text color="fg.muted" fontSize="sm">
            People with access to this collection
          </Text>
        </Box>

        <Stack gap="2">
          <CollectionMemberRow
            collectionId={collection.id}
            currentUserId={currentUser?.id}
            currentUserAccess={collection.access}
            mode={collection.access.canManageSharing ? 'manage' : 'view'}
            user={{ ...collection.owner, role: 'owner' }}
          />

          {members.map((member) => (
            <CollectionMemberRow
              key={member.id}
              collectionId={collection.id}
              currentUserId={currentUser?.id}
              currentUserAccess={collection.access}
              mode={collection.access.canManageSharing ? 'manage' : 'view'}
              user={toCollectionMemberRowUser(member)}
            />
          ))}
        </Stack>
      </Stack>
    </SimpleDialog>
  );
};

export default CollectionMembersDialog;
