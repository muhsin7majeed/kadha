import { useEffect } from 'react';

import { useSetAuthAtom } from '@/atoms/auth-atom';
import { AppRoutes } from '@/app/routes';
import { useGetMe } from '@/pages/user/profile/apis/use-get-me';

function App() {
  const setAuth = useSetAuthAtom();
  const { data, isError, isPending } = useGetMe();

  useEffect(() => {
    if (isPending) return;

    if (data) {
      setAuth({
        user: data,
        status: 'authenticated',
      });
    } else if (isError) {
      setAuth({
        user: null,
        status: 'unauthenticated',
      });
    }
  }, [data, isPending, isError, setAuth]);

  return <AppRoutes />;
}

export default App;
