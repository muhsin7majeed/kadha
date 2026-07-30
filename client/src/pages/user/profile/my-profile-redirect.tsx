import { Navigate } from 'react-router';

import { useAuth } from '@/features/auth/use-auth';

const MyProfileRedirect = () => {
  const auth = useAuth();

  if (!auth.user) {
    return null;
  }

  return <Navigate to={`/app/profile/${auth.user.username}`} replace />;
};

export default MyProfileRedirect;
