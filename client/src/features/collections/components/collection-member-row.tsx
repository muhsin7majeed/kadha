import { Badge, Button, HStack, NativeSelect, Stack, Text } from '@chakra-ui/react';
import { useState } from 'react';

import ConfirmationDialog from '@/components/dialogs/confirmation-dialog';
import UserLink from '@/components/user-link';
import useRemoveCollectionMember from '@/features/collections/api/use-remove-collection-member';
import useUpdateCollectionMemberRole from '@/features/collections/api/use-update-collection-member-role';
import { CollectionAccess, CollectionMemberRole, UserSummary } from '@/features/collections/collections.types';
import FriendshipActions from '@/pages/user/friendship/friendship-actions';

type CollectionMemberRowMode = 'view' | 'manage';

interface CreatorRowUser extends UserSummary {
  role: 'owner';
}

interface MemberRowUser extends UserSummary {
  memberId: string;
  role: CollectionMemberRole;
}

type CollectionMemberRowUser = CreatorRowUser | MemberRowUser;

interface CollectionMemberRowProps {
  collectionId: string;
  currentUserId?: string;
  currentUserAccess: CollectionAccess;
  mode: CollectionMemberRowMode;
  user: CollectionMemberRowUser;
}

const ROLE_LABELS: Record<CollectionMemberRole, string> = {
  viewer: 'Can view',
  editor: 'Can edit',
};

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as CollectionMemberRole,
  label,
}));

const getRoleLabel = (role: CollectionMemberRowUser['role']) => (role === 'owner' ? 'Owner' : ROLE_LABELS[role]);

const CollectionMemberRow: React.FC<CollectionMemberRowProps> = ({
  collectionId,
  currentUserId,
  currentUserAccess,
  mode,
  user,
}) => {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const updateMemberRole = useUpdateCollectionMemberRole();
  const removeMember = useRemoveCollectionMember();
  const isCurrentUser = user.id === currentUserId;
  const canManageMember = mode === 'manage' && currentUserAccess.canManageSharing && user.role !== 'owner';
  const shouldShowRoleText = user.role === 'owner' || !canManageMember;
  const canShowFriendshipActions =
    !isCurrentUser &&
    user.friendshipStatus !== undefined &&
    user.isRequestSender !== undefined;

  const handleRoleChange = (role: CollectionMemberRole) => {
    if (user.role === 'owner') return;

    updateMemberRole.mutate({
      collectionId,
      memberId: user.memberId,
      role,
    });
  };

  const handleRemoveMember = async () => {
    if (user.role === 'owner') return;

    await removeMember.mutateAsync({
      collectionId,
      memberId: user.memberId,
    });
    setIsRemoveDialogOpen(false);
  };

  return (
    <Stack
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="md"
      p="3"
      gap="3"
      direction={{ base: 'column', md: 'row' }}
      justifyContent="space-between"
      alignItems={{ base: 'stretch', md: 'center' }}
    >
      <Stack gap="1" minW={0}>
        <HStack gap="2" minW={0}>
          <UserLink username={user.username} minW={0} />
          {isCurrentUser && (
            <Badge variant="subtle" colorPalette="gray" size="sm" flexShrink={0}>
              You
            </Badge>
          )}
        </HStack>
        {shouldShowRoleText && (
          <Text color="fg.muted" fontSize="sm">
            {getRoleLabel(user.role)}
          </Text>
        )}
      </Stack>

      <Stack
        gap="2"
        direction={{ base: 'column', sm: 'row' }}
        justifyContent={{ base: 'stretch', md: 'flex-end' }}
        alignItems={{ base: 'stretch', sm: 'center' }}
      >
        {canShowFriendshipActions && (
          <FriendshipActions
            menuWithinDialog
            user={{
              id: user.id,
              friendshipStatus: user.friendshipStatus!,
              isRequestSender: user.isRequestSender!,
            }}
          />
        )}

        {canManageMember && (
          <>
            <NativeSelect.Root w={{ base: '100%', sm: '36' }} disabled={updateMemberRole.isPending}>
              <NativeSelect.Field value={user.role} onChange={(event) => handleRoleChange(event.target.value as CollectionMemberRole)}>
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>

            <Button
              size="sm"
              variant="outline"
              colorPalette="red"
              loading={removeMember.isPending}
              onClick={() => setIsRemoveDialogOpen(true)}
            >
              Remove
            </Button>
          </>
        )}
      </Stack>

      {user.role !== 'owner' && (
        <ConfirmationDialog
          isOpen={isRemoveDialogOpen}
          title="Remove member?"
          description={`Remove ${user.username} from this collection? They will lose access immediately.`}
          confirmButtonText="Remove"
          confirmButtonProps={{ colorPalette: 'red', loading: removeMember.isPending }}
          onOpenChange={setIsRemoveDialogOpen}
          onConfirm={handleRemoveMember}
        />
      )}
    </Stack>
  );
};

export default CollectionMemberRow;
