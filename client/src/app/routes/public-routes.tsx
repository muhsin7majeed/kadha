import { lazy } from 'react';
import { Route } from 'react-router';

const Landing = lazy(() => import('@/pages/landing'));
const Privacy = lazy(() => import('@/pages/privacy'));
const Settings = lazy(() => import('@/pages/settings'));
const Terms = lazy(() => import('@/pages/terms'));

export const publicRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="settings" element={<Settings />} />
    <Route path="terms" element={<Terms />} />
  </>
);
