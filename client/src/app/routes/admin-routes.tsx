import { lazy } from 'react';
import { Route } from 'react-router';

import AdminRoute from '@/components/admin-route';

const AdminFeedback = lazy(() => import('@/pages/admin/feedback'));
const AdminFeedbackDetail = lazy(() => import('@/pages/admin/feedback/feedback-detail'));
const AdminOverview = lazy(() => import('@/pages/admin'));
const AdminProviderUsage = lazy(() => import('@/pages/admin/provider-usage'));
const AdminUserDetail = lazy(() => import('@/pages/admin/users/user-detail'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));

export const adminRoutes = (
  <Route element={<AdminRoute />}>
    <Route path="admin" element={<AdminOverview />} />
    <Route path="admin/provider-usage" element={<AdminProviderUsage />} />
    <Route path="admin/feedback" element={<AdminFeedback />} />
    <Route path="admin/feedback/:id" element={<AdminFeedbackDetail />} />
    <Route path="admin/users" element={<AdminUsers />} />
    <Route path="admin/users/:id" element={<AdminUserDetail />} />
  </Route>
);
