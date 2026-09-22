import { lazy } from 'react';
import { Route } from 'react-router';

import AdminRoute from '@/components/admin-route';
import AdminLayout from '@/features/admin/components/admin-layout';

const AdminFeedback = lazy(() => import('@/pages/admin/feedback'));
const AdminFeedbackDetail = lazy(() => import('@/pages/admin/feedback/feedback-detail'));
const AdminOverview = lazy(() => import('@/pages/admin'));
const AdminProviderUsage = lazy(() => import('@/pages/admin/provider-usage'));
const AdminUserDetail = lazy(() => import('@/pages/admin/users/user-detail'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));

export const adminRoutes = (
  <Route element={<AdminRoute />}>
    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<AdminOverview />} />
      <Route path="provider-usage" element={<AdminProviderUsage />} />
      <Route path="feedback" element={<AdminFeedback />} />
      <Route path="feedback/:id" element={<AdminFeedbackDetail />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="users/:id" element={<AdminUserDetail />} />
    </Route>
  </Route>
);
