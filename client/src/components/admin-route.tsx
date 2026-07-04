import { Navigate, Outlet } from 'react-router';

import FullScreenSpinner from '@/components/spinners/full-screen-spinner';
import { useAuth } from '@/features/auth/use-auth';
import { UserRole } from '@/types/common';

const AdminRoute = () => {
  const auth = useAuth();

  if (auth.status === 'pending') {
    return <FullScreenSpinner />;
  }

  if (auth.user?.role !== UserRole.Admin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
