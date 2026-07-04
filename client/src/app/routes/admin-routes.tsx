import { lazy } from 'react';
import { Route } from 'react-router';

import AdminRoute from '@/components/admin-route';

const AdminOverview = lazy(() => import('@/pages/admin'));
const AdminUserDetail = lazy(() => import('@/pages/admin/users/user-detail'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));

export const adminRoutes = (
  <Route element={<AdminRoute />}>
    <Route path="admin" element={<AdminOverview />} />
    <Route path="admin/users" element={<AdminUsers />} />
    <Route path="admin/users/:id" element={<AdminUserDetail />} />
  </Route>
);
