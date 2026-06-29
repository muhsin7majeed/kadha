import { Navigate, Outlet } from 'react-router';

import { useAuthAtom } from '@/atoms/auth-atom';
import FullScreenSpinner from '@/components/spinners/full-screen-spinner';
import { UserRole } from '@/types/common';

const AdminRoute = () => {
  const [auth] = useAuthAtom();

  if (auth.user && !auth.user.role) {
    return <FullScreenSpinner />;
  }

  if (auth.user?.role !== UserRole.Admin) {
    return <Navigate to="/app" replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
