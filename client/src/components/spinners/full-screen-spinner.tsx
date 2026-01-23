import { Box, Spinner } from '@chakra-ui/react';

const FullScreenSpinner = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Spinner size="sm" />
    </Box>
  );
};

export default FullScreenSpinner;
