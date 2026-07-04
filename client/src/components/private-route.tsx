import { Navigate, Outlet, useLocation } from 'react-router';

import FullScreenSpinner from './spinners/full-screen-spinner';
import { Container } from '@chakra-ui/react';
import { useAuth } from '@/features/auth/use-auth';

const PrivateRoute = () => {
  const auth = useAuth();

  const location = useLocation();

  if (auth.status === 'pending') return <FullScreenSpinner />;

  if (auth.status === 'unauthenticated') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <Container maxW="6xl" p="0">
      <Outlet />
    </Container>
  );
};

export default PrivateRoute;
