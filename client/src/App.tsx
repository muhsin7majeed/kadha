import { Route, Routes } from 'react-router';
import { Container } from '@chakra-ui/react';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import AuthLayout from '@/pages/auth/AuthLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/home';

function App() {
  return (
    <Container>
      <Routes>
        <Route
          index
          element={
            <ProtectedRoute>
              <Home />
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
