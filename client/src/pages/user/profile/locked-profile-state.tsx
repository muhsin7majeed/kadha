import { Card, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { LuLock } from 'react-icons/lu';

interface LockedProfileStateProps {
  lockedReason?: 'FRIENDS_ONLY' | 'PRIVATE' | 'SIGN_IN_REQUIRED';
}

const LockedProfileState: React.FC<LockedProfileStateProps> = ({ lockedReason }) => {
  const isSignInRequired = lockedReason === 'SIGN_IN_REQUIRED';
  const isFriendsOnly = lockedReason === 'FRIENDS_ONLY';
  const title = isSignInRequired ? 'Sign in required' : isFriendsOnly ? 'Friends-only profile' : 'Private profile';
  const description = isSignInRequired
    ? 'This user shares profile activity with Kadha users or friends. Sign in to check your access.'
    : isFriendsOnly
      ? 'This user only shares profile activity with accepted friends. Use the profile actions above to send a friend request.'
      : 'This user is not sharing profile activity right now.';

  return (
    <Card.Root variant="outline" bg="bg.subtle">
      <Card.Body>
        <HStack gap="4" align="flex-start">
          <Icon color="fg.muted" boxSize="5" mt="1">
            <LuLock />
          </Icon>

          <Stack gap="1">
            <Text fontWeight="semibold">{title}</Text>
            <Text color="fg.muted">{description}</Text>
          </Stack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default LockedProfileState;
