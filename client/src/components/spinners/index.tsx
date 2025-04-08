import { Box, Spinner } from '@chakra-ui/react';
import { FaSyncAlt } from 'react-icons/fa';

const SyncSpinner = ({ size = 24 }: { size?: number }) => {
  return (
    <Box css={{ animation: 'spin 1s linear infinite' }} width="fit-content" height="fit-content" display="inline-block">
      <FaSyncAlt size={size} />
    </Box>
  );
};

export default SyncSpinner;

export const FullScreenSpinner = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Spinner size="sm" />
    </Box>
  );
};
