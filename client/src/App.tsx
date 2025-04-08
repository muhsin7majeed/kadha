import { Route, Routes, Navigate } from 'react-router';
import { Container } from '@chakra-ui/react';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import AuthLayout from '@/pages/auth/AuthLayout';
import MainLayout from '@/components/main-layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import PublicRoute from '@/components/PublicRoute';
import { useAuthAtom } from '@/atoms/authAtom';
import AuthProvider from './components/AuthProvider';
import Landing from './pages/landing';
import Home from './pages/home';

function App() {
  const auth = useAuthAtom();

  return (
    <AuthProvider>
      <Container>
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
              <Route path="watched" element={<div>Watched</div>} />
              <Route path="watchlist" element={<div>Watchlist</div>} />
              <Route path="media/:mediaType/:id" element={<div>Details</div>} />
            </Route>
          </Route>

          <Route path="*" element={auth.token ? <Navigate to="/app" replace /> : <Navigate to="/" replace />} />
        </Routes>
      </Container>
    </AuthProvider>
  );
}

export default App;
