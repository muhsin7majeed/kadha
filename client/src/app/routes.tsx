import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import FullScreenSpinner from '@/components/spinners/full-screen-spinner';
import AdminRoute from '@/components/admin-route';
import PrivateRoute from '@/components/private-route';
import PublicRoute from '@/components/public-route';

const MainLayout = lazy(() => import('@/components/main-layout'));
const Activity = lazy(() => import('@/pages/activity'));
const AdminOverview = lazy(() => import('@/pages/admin'));
const AdminUserDetail = lazy(() => import('@/pages/admin/users/user-detail'));
const AdminUsers = lazy(() => import('@/pages/admin/users'));
const AuthLayout = lazy(() => import('@/pages/auth/auth-layout'));
const Login = lazy(() => import('@/pages/auth/login'));
const Register = lazy(() => import('@/pages/auth/register'));
const Collections = lazy(() => import('@/pages/collections'));
const Friends = lazy(() => import('@/pages/user/friendship/friends'));
const FriendshipList = lazy(() => import('@/pages/user/friendship/friends/friendship-list'));
const Home = lazy(() => import('@/pages/home'));
const Landing = lazy(() => import('@/pages/landing'));
const Liked = lazy(() => import('@/pages/liked'));
const MediaDetails = lazy(() => import('@/pages/media-details'));
const Notifications = lazy(() => import('@/pages/notifications'));
const UserProfile = lazy(() => import('@/pages/user/profile'));
const OtherUserCollectionsTab = lazy(() => import('@/pages/user/profile/other-user-data/collections-tab'));
const OtherUserMediaTab = lazy(() => import('@/pages/user/profile/other-user-data/media-tab'));
const Watched = lazy(() => import('@/pages/watched'));
const Watchlist = lazy(() => import('@/pages/watchlist'));

export function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        <Route path="/" element={<Landing />} />

        <Route element={<PublicRoute />}>
          <Route path="auth" element={<AuthLayout />}>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Route>

        <Route element={<PrivateRoute />}>
          <Route path="app" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="activity" element={<Activity />} />
            <Route path="watched" element={<Watched />} />
            <Route path="watchlist" element={<Watchlist />} />
            <Route path="liked" element={<Liked />} />
            <Route path="media/:mediaType/:id" element={<MediaDetails />} />
            <Route path="collections" element={<Collections />} />

            <Route path="profile">
              <Route index element={<UserProfile />} />

              <Route path=":username" element={<UserProfile />}>
                <Route index element={<Navigate to="watched" replace />} />
                <Route path="watched" element={<OtherUserMediaTab type="watched" />} />
                <Route path="liked" element={<OtherUserMediaTab type="liked" />} />
                <Route path="watchlist" element={<OtherUserMediaTab type="watchlist" />} />
                <Route path="collections" element={<OtherUserCollectionsTab />} />
              </Route>
            </Route>

            <Route path="notifications" element={<Notifications />} />

            <Route element={<AdminRoute />}>
              <Route path="admin" element={<AdminOverview />} />
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/users/:id" element={<AdminUserDetail />} />
            </Route>

            <Route path="friends" element={<Friends />}>
              <Route index element={<Navigate to="friends" replace />} />
              <Route
                path="friends"
                element={
                  <FriendshipList
                    type="friends"
                    emptyTitle="No friends yet"
                    emptyDescription="Your friends will appear here"
                  />
                }
              />
              <Route
                path="sent"
                element={
                  <FriendshipList
                    type="sent"
                    emptyTitle="No sent requests"
                    emptyDescription="Friend requests you've sent will appear here"
                  />
                }
              />
              <Route
                path="received"
                element={
                  <FriendshipList
                    type="received"
                    emptyTitle="No pending requests"
                    emptyDescription="Friend requests you've received will appear here"
                  />
                }
              />
              <Route
                path="blocked"
                element={
                  <FriendshipList
                    type="blocked"
                    emptyTitle="No blocked users"
                    emptyDescription="Users you've blocked will appear here"
                  />
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
