import { Card, HStack, Icon, Stack, Text } from '@chakra-ui/react';
import { LuLock } from 'react-icons/lu';

interface LockedProfileStateProps {
  lockedReason?: 'FRIENDS_ONLY' | 'PRIVATE';
}

const LockedProfileState: React.FC<LockedProfileStateProps> = ({ lockedReason }) => {
  const isFriendsOnly = lockedReason === 'FRIENDS_ONLY';

  return (
    <Card.Root variant="outline" bg="bg.subtle">
      <Card.Body>
        <HStack gap="4" align="flex-start">
          <Icon color="fg.muted" boxSize="5" mt="1">
            <LuLock />
          </Icon>

          <Stack gap="1">
            <Text fontWeight="semibold">{isFriendsOnly ? 'Friends-only profile' : 'Private profile'}</Text>
            <Text color="fg.muted">
              {isFriendsOnly
                ? 'This user only shares profile activity with accepted friends. Use the profile actions above to send a friend request.'
                : 'This user is not sharing profile activity right now.'}
            </Text>
          </Stack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default LockedProfileState;
