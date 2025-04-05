import { Route, Routes } from 'react-router';
import { Container } from '@chakra-ui/react';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import AuthLayout from '@/pages/auth/AuthLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import MainLayout from '@/components/mainLayout';
import Home from './pages/home';
import { useGenreMap } from './hooks/useGenreMap';

function App() {
  useGenreMap(); // fetch and store genre map

  return (
    <Container>
      <Routes>
        <Route path="auth/*" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="watched" element={<div>Watched</div>} />
          <Route path="watchlist" element={<div>Watchlist</div>} />
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Container>
  );
}

export default App;
