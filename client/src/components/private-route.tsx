import { Navigate, Outlet, useLocation } from 'react-router';

import FullScreenSpinner from './spinners/full-screen-spinner';
import { useAuthAtom } from '@/atoms/auth-atom';
import { Container } from '@chakra-ui/react';

const PrivateRoute = () => {
  const [auth] = useAuthAtom();

  const location = useLocation();

  if (auth.status === 'pending') return <FullScreenSpinner />;

  if (auth.status === 'unauthenticated') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <Container maxW="6xl">
      <Outlet />
    </Container>
  );
};

export default PrivateRoute;
