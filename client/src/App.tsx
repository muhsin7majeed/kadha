import { Route, Routes } from 'react-router';
import { Container } from '@chakra-ui/react';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Landing from '@/pages/landing/Landing';
import AuthLayout from '@/pages/auth/AuthLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  return (
    <Container>
      <Routes>
        <Route
          index
          element={
            <ProtectedRoute>
              <Landing />
            </ProtectedRoute>
          }
        />

        <Route path="auth/*" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Container>
  );
}

export default App;
