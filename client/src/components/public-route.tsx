import { Navigate, Outlet, useLocation } from 'react-router';

import FullScreenSpinner from './spinners/full-screen-spinner';
import { useAuth } from '@/features/auth/use-auth';

const PublicRoute = () => {
  const auth = useAuth();

  const location = useLocation();

  if (auth.status === 'pending') return <FullScreenSpinner />;

  if (auth.status === 'authenticated') {
    return <Navigate to="/app" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

export default PublicRoute;
