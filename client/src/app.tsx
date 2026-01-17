import { Route, Routes, Navigate } from 'react-router';

import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import AuthLayout from '@/pages/auth/auth-layout';
import MainLayout from '@/components/main-layout';
import ProtectedRoute from '@/components/protected-route';
import PublicRoute from '@/components/public-route';
import { useAuthAtom } from '@/atoms/authAtom';
import AuthProvider from './components/auth-provider';
import Landing from './pages/landing';
import Home from './pages/home';
import MediaDetails from './pages/media-details';
import Watchlist from './pages/watchlist';
import Liked from './pages/liked';
import Watched from './pages/watched';

function App() {
  const auth = useAuthAtom();

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicRoute />}>
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="app" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="watched" element={<Watched />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="liked" element={<Liked />} />
            <Route path="media/:mediaType/:id" element={<MediaDetails />} />
          </Route>
        </Route>

        <Route path="*" element={auth.token ? <Navigate to="/app" replace /> : <Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
