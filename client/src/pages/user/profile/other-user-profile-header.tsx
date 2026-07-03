import FriendshipActions from '@/pages/user/friendship/friendship-actions';
import { UserProfileResponse } from '@/features/user/user.types';
import { Badge, Box, Card, HStack, Stack, Text } from '@chakra-ui/react';
import SimpleAvatar from '@/components/simple-avatar';
import { DataPrivacy, FriendStatus } from '@/types/common';

interface OtherUserProfileHeaderProps {
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

const OtherUserProfileHeader: React.FC<OtherUserProfileHeaderProps> = ({ profile }) => {
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
              <Text as="h2" textStyle="2xl" fontWeight="semibold" wordBreak="break-word">
                {profile.username}
              </Text>

              <HStack gap="2" flexWrap="wrap" mt="2">
                <Badge variant="surface" colorPalette="gray">
                  {profilePrivacyLabel[profile.profilePrivacy]}
                </Badge>
                {connectionLabel && <Badge variant="surface">{connectionLabel}</Badge>}
                {profile.access.canView && (
                  <Badge variant="surface" colorPalette="brand">
                    {visibleSectionCount} visible {visibleSectionCount === 1 ? 'section' : 'sections'}
                  </Badge>
                )}
              </HStack>
            </Box>
          </HStack>

          <Box alignSelf={{ base: 'stretch', md: 'center' }}>
            <FriendshipActions user={profile} />
          </Box>
        </Stack>
      </Card.Body>
    </Card.Root>
  );
};

export default OtherUserProfileHeader;
