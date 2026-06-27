import { Navigate, Route, Routes } from 'react-router';

import MainLayout from '@/components/main-layout';
import PrivateRoute from '@/components/private-route';
import PublicRoute from '@/components/public-route';
import AuthLayout from '@/pages/auth/auth-layout';
import Login from '@/pages/auth/login';
import Register from '@/pages/auth/register';
import Collections from '@/pages/collections';
import Friends from '@/pages/user/friendship/friends';
import FriendshipList from '@/pages/user/friendship/friends/friendship-list';
import Home from '@/pages/home';
import Landing from '@/pages/landing';
import Liked from '@/pages/liked';
import MediaDetails from '@/pages/media-details';
import Notifications from '@/pages/notifications';
import UserProfile from '@/pages/user/profile';
import Watched from '@/pages/watched';
import Watchlist from '@/pages/watchlist';

export function AppRoutes() {
  return (
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
          <Route path="watched" element={<Watched />} />
          <Route path="watchlist" element={<Watchlist />} />
          <Route path="liked" element={<Liked />} />
          <Route path="media/:mediaType/:id" element={<MediaDetails />} />
          <Route path="collections" element={<Collections />} />

          <Route path="profile">
            <Route index element={<UserProfile />} />

            <Route path=":username" element={<UserProfile />}>
              <Route index element={<Navigate to="watched" replace />} />
              <Route path="watched" element={<h1>Watched</h1>} />
              <Route path="liked" element={<h1>Liked</h1>} />
              <Route path="watchlist" element={<h1>Watchlist</h1>} />
              <Route path="collections" element={<h1>Collections</h1>} />
            </Route>
          </Route>

          <Route path="notifications" element={<Notifications />} />
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
  );
}
