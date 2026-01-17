import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthAtom } from '@/atoms/auth-atom';
import { FullScreenSpinner } from './spinners';

export const PublicRoute = () => {
  const auth = useAuthAtom();

  const location = useLocation();

  if (auth.isLoading) return <FullScreenSpinner />;

  if (auth.token) {
    return <Navigate to="/app" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PublicRoute;
