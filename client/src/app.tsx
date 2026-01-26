import { Route, Routes, Navigate } from 'react-router';

import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import AuthLayout from '@/pages/auth/auth-layout';
import MainLayout from '@/components/main-layout';
import PublicRoute from '@/components/public-route';
import Landing from './pages/landing';
import Home from './pages/home';
import MediaDetails from './pages/media-details';
import Watchlist from './pages/watchlist';
import Liked from './pages/liked';
import Watched from './pages/watched';
import PrivateRoute from './components/private-route';
import { useGetMe } from './pages/profile/apis/use-get-me';
import { useEffect } from 'react';
import { useSetAuthAtom } from './atoms/auth-atom';
import Collections from './pages/collections';
import UserProfile from './pages/profile';

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

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicRoute />}>
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="app" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="watched" element={<Watched />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="liked" element={<Liked />} />
            <Route path="media/:mediaType/:id" element={<MediaDetails />} />
            <Route path="collections" element={<Collections />} />

            <Route path="profile" element={<UserProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
