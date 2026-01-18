import { Navigate, Outlet, useLocation } from 'react-router';

import { FullScreenSpinner } from './spinners';
import { useAuthAtom } from '@/atoms/auth-atom';

const PublicRoute = () => {
  const [auth] = useAuthAtom();

  const location = useLocation();

  if (auth.status === 'pending') return <FullScreenSpinner />;

  if (auth.status === 'authenticated') {
    return <Navigate to="/app" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PublicRoute;
