import FriendshipActions from '@/pages/user/friendship/friendship-actions';
import { UserProfileResponse } from '@/features/user/user.types';
import { Box, Stack, Text } from '@chakra-ui/react';

interface OtherUserProfileHeaderProps {
  profile: UserProfileResponse;
}

const OtherUserProfileHeader: React.FC<OtherUserProfileHeaderProps> = ({ profile }) => {
  return (
    <Stack direction={{ base: 'column', md: 'row' }} justify="space-between" align={{ base: 'start', md: 'center' }}>
      <Box>
        <Text as="h2" textStyle="2xl" fontWeight="semibold">
          {profile.username}
        </Text>
      </Box>

      <FriendshipActions user={profile} />
    </Stack>
  );
};

export default OtherUserProfileHeader;
