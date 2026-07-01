import { useState } from 'react';
import { Badge, Box, Button, Field, HStack, Input, NativeSelect, Separator, Stack, Text } from '@chakra-ui/react';

import EmptyState from '@/components/info-states/empty-state';
import ErrorState from '@/components/info-states/error-state';
import CommonSpinner from '@/components/spinners/common-spinner';
import useCollection from '@/features/collections/api/use-collection';
import useCollectionInvites from '@/features/collections/api/use-collection-invites';
import useCreateCollectionInvite from '@/features/collections/api/use-create-collection-invite';
import useRemoveCollectionMember from '@/features/collections/api/use-remove-collection-member';
import useRevokeCollectionInvite from '@/features/collections/api/use-revoke-collection-invite';
import useSearchCollectionInviteUsers from '@/features/collections/api/use-search-collection-invite-users';
import useUpdateCollectionMemberRole from '@/features/collections/api/use-update-collection-member-role';
import {
  Collection,
  CollectionInviteUserSearchResult,
  CollectionMember,
  CollectionMemberRole,
} from '@/features/collections/collections.types';

interface CollectionSharingDialogProps {
  collection: Collection;
  open: boolean;
}

const ROLE_LABELS: Record<CollectionMemberRole, string> = {
  viewer: 'Can view',
  editor: 'Can edit',
};

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
  value: value as CollectionMemberRole,
  label,
}));

const getUserStateLabel = (user: CollectionInviteUserSearchResult) => {
  if (user.state === 'pending') return 'Pending';
  if (user.state === 'member') return user.currentRole === 'editor' ? 'Editor' : 'Viewer';
  return null;
};

const CollectionSharingDialog: React.FC<CollectionSharingDialogProps> = ({ collection, open }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Record<string, CollectionMemberRole>>({});

  const collectionQuery = useCollection({ collectionId: collection.id, enabled: open });
  const invitesQuery = useCollectionInvites(collection.id, open);
  const usersQuery = useSearchCollectionInviteUsers(collection.id, searchQuery, open);
  const createInvite = useCreateCollectionInvite();
  const revokeInvite = useRevokeCollectionInvite();
  const updateMemberRole = useUpdateCollectionMemberRole();
  const removeMember = useRemoveCollectionMember();

  const collectionData = collectionQuery.data;
  const searchResults = usersQuery.data ?? [];
  const pendingInvites = invitesQuery.data ?? [];

  const getSelectedRole = (userId: string) => selectedRoles[userId] ?? 'viewer';

  const handleInvite = (user: CollectionInviteUserSearchResult) => {
    createInvite.mutate({
      collectionId: collection.id,
      inviteeId: user.id,
      role: getSelectedRole(user.id),
    });
  };

  const handleMemberRoleChange = (member: CollectionMember, role: CollectionMemberRole) => {
    updateMemberRole.mutate({
      collectionId: collection.id,
      memberId: member.id,
      role,
    });
  };

  return (
    <Stack gap="5">
      <Stack gap="1">
        <Text fontWeight="semibold">{collection.name}</Text>
        <HStack gap="2" flexWrap="wrap">
          <Badge variant="surface">{collectionData?.memberCount ?? collection.memberCount ?? 1} members</Badge>
          {collectionData?.owner && <Badge variant="surface">Owner: {collectionData.owner.username}</Badge>}
        </HStack>
      </Stack>

      <Separator />

      <Stack gap="3">
        <Text fontWeight="medium">Search users</Text>
        <Field.Root>
          <Field.Label>Username</Field.Label>
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by username"
          />
        </Field.Root>

        {usersQuery.isLoading ? (
          <CommonSpinner />
        ) : usersQuery.isError ? (
          <ErrorState title="Error" description="Error searching users" onRetry={usersQuery.refetch} />
        ) : searchQuery.trim() && searchResults.length === 0 ? (
          <EmptyState title="No users" description="No users found" />
        ) : (
          <Stack gap="2">
            {searchResults.map((user) => (
              <Box key={user.id} border="1px solid" borderColor="border.subtle" borderRadius="md" p="3">
                <Stack direction={{ base: 'column', md: 'row' }} justifyContent="space-between" gap="3">
                  <Stack gap="1">
                    <HStack gap="2">
                      <Text fontWeight="medium">{user.username}</Text>
                      {getUserStateLabel(user) && <Badge variant="surface">{getUserStateLabel(user)}</Badge>}
                    </HStack>
                  </Stack>

                  <HStack gap="2" justifyContent={{ base: 'stretch', md: 'flex-end' }}>
                    <NativeSelect.Root maxW="36" disabled={user.state !== 'available'}>
                      <NativeSelect.Field
                        value={getSelectedRole(user.id)}
                        onChange={(event) =>
                          setSelectedRoles((current) => ({
                            ...current,
                            [user.id]: event.target.value as CollectionMemberRole,
                          }))
                        }
                      >
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
                      colorPalette="orange"
                      disabled={user.state !== 'available'}
                      loading={createInvite.isPending}
                      onClick={() => handleInvite(user)}
                    >
                      Invite
                    </Button>
                  </HStack>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Stack>

      <Separator />

      <Stack gap="3">
        <Text fontWeight="medium">Pending invitations</Text>
        {invitesQuery.isLoading ? (
          <CommonSpinner />
        ) : invitesQuery.isError ? (
          <ErrorState title="Error" description="Error loading invitations" onRetry={invitesQuery.refetch} />
        ) : pendingInvites.length === 0 ? (
          <EmptyState title="No pending invitations" description="No pending invitations found" />
        ) : (
          <Stack gap="2">
            {pendingInvites.map((invite) => (
              <HStack
                key={invite.id}
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
                  <Text fontWeight="medium">{invite.invitee.username}</Text>
                  <Badge variant="surface" w="fit-content">
                    {ROLE_LABELS[invite.role]}
                  </Badge>
                </Stack>

                <Button
                  size="sm"
                  variant="outline"
                  colorPalette="red"
                  loading={revokeInvite.isPending}
                  onClick={() => revokeInvite.mutate({ collectionId: collection.id, inviteId: invite.id })}
                >
                  Revoke
                </Button>
              </HStack>
            ))}
          </Stack>
        )}
      </Stack>

      <Separator />

      <Stack gap="3">
        <Text fontWeight="medium">Members</Text>
        {collectionQuery.isLoading ? (
          <CommonSpinner />
        ) : collectionQuery.isError ? (
          <ErrorState title="Error" description="Error loading members" onRetry={collectionQuery.refetch} />
        ) : !collectionData ? (
          <EmptyState title="No collection" description="No collection found" />
        ) : (
          <Stack gap="2">
            <HStack
              justifyContent="space-between"
              border="1px solid"
              borderColor="border.subtle"
              borderRadius="md"
              p="3"
              gap="3"
            >
              <Text fontWeight="medium">{collectionData.owner.username}</Text>
              <Badge variant="surface">Owner</Badge>
            </HStack>

            {collectionData.members.length === 0 ? (
              <EmptyState title="No members" description="No members found" />
            ) : (
              collectionData.members.map((member) => (
                <HStack
                  key={member.id}
                  justifyContent="space-between"
                  border="1px solid"
                  borderColor="border.subtle"
                  borderRadius="md"
                  p="3"
                  gap="3"
                  alignItems={{ base: 'flex-start', md: 'center' }}
                  flexDirection={{ base: 'column', md: 'row' }}
                >
                  <Text fontWeight="medium">{member.user.username}</Text>

                  <HStack gap="2" justifyContent={{ base: 'stretch', md: 'flex-end' }}>
                    <NativeSelect.Root maxW="36" disabled={updateMemberRole.isPending}>
                      <NativeSelect.Field
                        value={member.role}
                        onChange={(event) =>
                          handleMemberRoleChange(member, event.target.value as CollectionMemberRole)
                        }
                      >
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
                      onClick={() => removeMember.mutate({ collectionId: collection.id, memberId: member.id })}
                    >
                      Remove
                    </Button>
                  </HStack>
                </HStack>
              ))
            )}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};

export default CollectionSharingDialog;
