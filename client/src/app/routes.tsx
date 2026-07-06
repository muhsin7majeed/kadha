import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import FullScreenSpinner from '@/components/spinners/full-screen-spinner';
import PrivateRoute from '@/components/private-route';
import { adminRoutes } from './routes/admin-routes';
import { authRoutes } from './routes/auth-routes';
import { friendshipRoutes } from './routes/friendship-routes';
import { profileRoutes } from './routes/profile-routes';
import { publicRoutes } from './routes/public-routes';

const MainLayout = lazy(() => import('@/components/main-layout'));
const Activity = lazy(() => import('@/pages/activity'));
const Collections = lazy(() => import('@/pages/collections'));
const Home = lazy(() => import('@/pages/home'));
const InProgress = lazy(() => import('@/pages/in-progress'));
const Liked = lazy(() => import('@/pages/liked'));
const MediaDetails = lazy(() => import('@/pages/media-details'));
const Notifications = lazy(() => import('@/pages/notifications'));
const Settings = lazy(() => import('@/pages/settings'));
const Watched = lazy(() => import('@/pages/watched'));
const Watchlist = lazy(() => import('@/pages/watchlist'));

export function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        {publicRoutes}
        {authRoutes}

        <Route element={<PrivateRoute />}>
          <Route path="app" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="activity" element={<Activity />} />
            <Route path="watched" element={<Watched />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="in-progress" element={<InProgress />} />
            <Route path="liked" element={<Liked />} />
            <Route path="media/:mediaType/:id" element={<MediaDetails />} />
            <Route path="collections" element={<Collections />} />
            <Route path="settings" element={<Settings />} />

            {profileRoutes}
            <Route path="notifications" element={<Notifications />} />
            {adminRoutes}
            {friendshipRoutes}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
