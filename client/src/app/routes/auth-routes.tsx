import { lazy } from 'react';
import { Route } from 'react-router';

import PublicRoute from '@/components/public-route';

const AuthLayout = lazy(() => import('@/pages/auth/auth-layout'));
const Login = lazy(() => import('@/pages/auth/login'));
const Register = lazy(() => import('@/pages/auth/register'));

export const authRoutes = (
  <Route element={<PublicRoute />}>
    <Route path="auth" element={<AuthLayout />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
    </Route>
  </Route>
);
