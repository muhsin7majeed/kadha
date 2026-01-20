import { Box, BoxProps, Spinner } from '@chakra-ui/react';
import { FaSyncAlt } from 'react-icons/fa';

interface SyncSpinnerProps extends BoxProps {
  size?: number;
}

const SyncSpinner: React.FC<SyncSpinnerProps> = ({ size = 18, ...props }) => {
  return (
    <Box
      css={{ animation: 'spin 1s linear infinite' }}
      width="fit-content"
      height="fit-content"
      display="inline-block"
      {...props}
    >
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
