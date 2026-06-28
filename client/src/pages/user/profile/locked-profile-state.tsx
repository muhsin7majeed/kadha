import { Box, Text } from '@chakra-ui/react';

interface LockedProfileStateProps {
  lockedReason?: 'FRIENDS_ONLY' | 'PRIVATE';
}

const LockedProfileState: React.FC<LockedProfileStateProps> = ({ lockedReason }) => {
  return (
    <Box border="1px solid" borderColor="border.muted" borderRadius="md" p="5" bg="bg.subtle">
      <Text color="fg.muted">
        {lockedReason === 'FRIENDS_ONLY' ? 'This profile is visible to friends only.' : 'Private profile.'}
      </Text>
    </Box>
  );
};

export default LockedProfileState;
