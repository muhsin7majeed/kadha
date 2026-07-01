import { Badge, Button, HStack, NativeSelect, Stack, Text } from '@chakra-ui/react';

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

const CollectionMemberRow: React.FC<CollectionMemberRowProps> = ({
  collectionId,
  currentUserId,
  currentUserAccess,
  mode,
  user,
}) => {
  const updateMemberRole = useUpdateCollectionMemberRole();
  const removeMember = useRemoveCollectionMember();
  const isCurrentUser = user.id === currentUserId;
  const canManageMember = mode === 'manage' && currentUserAccess.canManageSharing && user.role !== 'owner';
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

  const handleRemoveMember = () => {
    if (user.role === 'owner') return;

    removeMember.mutate({
      collectionId,
      memberId: user.memberId,
    });
  };

  return (
    <HStack
      justifyContent="space-between"
      border="1px solid"
      borderColor="border.subtle"
      borderRadius="md"
      p="3"
      gap="3"
      alignItems={{ base: 'flex-start', md: 'center' }}
      flexDirection={{ base: 'column', md: 'row' }}
    >
      <Stack gap="1">
        <UserLink username={user.username} />
        <Badge variant="surface" w="fit-content">
          {user.role === 'owner' ? 'Creator' : ROLE_LABELS[user.role]}
        </Badge>
      </Stack>

      <HStack gap="2" justifyContent={{ base: 'stretch', md: 'flex-end' }} flexWrap="wrap">
        {canShowFriendshipActions && (
          <FriendshipActions
            user={{
              id: user.id,
              friendshipStatus: user.friendshipStatus!,
              isRequestSender: user.isRequestSender!,
            }}
          />
        )}

        {canManageMember && (
          <>
            <NativeSelect.Root maxW="36" disabled={updateMemberRole.isPending}>
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
              onClick={handleRemoveMember}
            >
              Remove
            </Button>
          </>
        )}

        {isCurrentUser && (
          <Text color="fg.muted" fontSize="sm">
            You
          </Text>
        )}
      </HStack>
    </HStack>
  );
};

export default CollectionMemberRow;
