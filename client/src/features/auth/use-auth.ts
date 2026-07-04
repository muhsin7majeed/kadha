import { useGetMe } from '@/features/user/api/use-get-me';
import { User } from '@/features/user/user.types';

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthState {
  status: AuthStatus;
  user: User | null;
}

export const useAuth = (): AuthState => {
  const { data: user, isError, isPending } = useGetMe();

  if (isPending) {
    return {
      status: 'pending',
      user: null,
    };
  }

  if (isError || !user) {
    return {
      status: 'unauthenticated',
      user: null,
    };
  }

  return {
    status: 'authenticated',
    user,
  };
};
