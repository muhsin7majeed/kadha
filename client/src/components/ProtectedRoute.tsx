import { useAtom } from 'jotai';
import { Navigate, useLocation } from 'react-router';

import { authAtom } from '@/store/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [auth] = useAtom(authAtom);
  const location = useLocation();

  if (!auth.user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
