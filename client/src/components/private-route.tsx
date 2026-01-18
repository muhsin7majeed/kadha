import { Navigate, Outlet, useLocation } from 'react-router';

import { FullScreenSpinner } from './spinners';
import { useAuthAtom } from '@/atoms/auth-atom';

const PrivateRoute = () => {
  const [auth] = useAuthAtom();

  const location = useLocation();

  if (auth.status === 'pending') return <FullScreenSpinner />;

  if (auth.status === 'unauthenticated') {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PrivateRoute;
