import { Badge, Box, Button, Card, HStack, Stack, Text } from '@chakra-ui/react';
import { LuPencil, LuShield } from 'react-icons/lu';
import { Link } from 'react-router';

import SimpleAvatar from '@/components/simple-avatar';
import FriendshipActions from '@/features/friendship/components/friendship-actions';
import type { UserProfileResponse } from '@/features/user/user.types';
import { DataPrivacy, FriendStatus } from '@/types/common';

interface ProfileHeaderProps {
  isOwner?: boolean;
  profile: UserProfileResponse;
}

const profilePrivacyLabel: Record<DataPrivacy, string> = {
  [DataPrivacy.Everyone]: 'Public profile',
  [DataPrivacy.Friends]: 'Friends-only profile',
  [DataPrivacy.OnlyMe]: 'Private profile',
};

const friendshipLabel: Partial<Record<FriendStatus, string>> = {
  [FriendStatus.Accepted]: 'Friend',
  [FriendStatus.PendingSent]: 'Request sent',
  [FriendStatus.PendingReceived]: 'Request received',
  [FriendStatus.BlockedByMe]: 'Blocked',
  [FriendStatus.BlockedMe]: 'Unavailable',
};

const ProfileHeader = ({ isOwner = false, profile }: ProfileHeaderProps) => {
  const visibleSectionCount = Object.values(profile.sections).filter(Boolean).length;
  const connectionLabel = friendshipLabel[profile.friendshipStatus];

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          justify="space-between"
          align={{ base: 'stretch', md: 'center' }}
          gap="4"
        >
          <HStack gap="4" align="center">
            <SimpleAvatar fallbackName={profile.username} size="xl" flexShrink={0} />

            <Box minW="0">
              <Text as="h2" textStyle="pageTitle" wordBreak="break-word">
                {profile.username}
              </Text>

              <HStack gap="2" flexWrap="wrap" mt="2">
                <Badge variant="surface" colorPalette="gray">
                  {profilePrivacyLabel[profile.profilePrivacy]}
                </Badge>
                {!isOwner && connectionLabel && <Badge variant="surface">{connectionLabel}</Badge>}
                {!isOwner && profile.access.canView && (
                  <Badge variant="surface" colorPalette="brand">
                    {visibleSectionCount} visible {visibleSectionCount === 1 ? 'section' : 'sections'}
                  </Badge>
                )}
              </HStack>
            </Box>
          </HStack>

          <Box alignSelf={{ base: 'stretch', md: 'center' }}>
            {isOwner ? (
              <Stack direction={{ base: 'column', sm: 'row' }} gap="2">
                <Button asChild variant="outline" colorPalette="gray">
                  <Link to="/app/settings/account">
                    <LuPencil />
                    Edit profile
                  </Link>
                </Button>
                <Button asChild variant="subtle" colorPalette="brand">
                  <Link to="/app/settings/privacy">
                    <LuShield />
                    Manage privacy
                  </Link>
                </Button>
              </Stack>
            ) : (
              <FriendshipActions user={profile} />
            )}
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default ProfileHeader;
