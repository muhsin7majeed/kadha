import { Navigate, Outlet, useLocation } from 'react-router';

import { useAuthAtom } from '@/atoms/authAtom';
import { FullScreenSpinner } from './spinners';

const ProtectedRoute = () => {
  const auth = useAuthAtom();

  const location = useLocation();

  if (auth.isLoading) return <FullScreenSpinner />;

  if (!auth.user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
