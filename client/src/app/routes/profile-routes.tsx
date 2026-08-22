import { lazy } from 'react';
import { Route } from 'react-router';

const OtherUserCollectionsTab = lazy(() => import('@/pages/user/profile/other-user-data/collections-tab'));
const OtherUserMediaTab = lazy(() => import('@/pages/user/profile/other-user-data/media-tab'));
const MyProfileRedirect = lazy(() => import('@/pages/user/profile/my-profile-redirect'));
const ViewingOverview = lazy(() => import('@/pages/user/profile/overview'));
const UserProfile = lazy(() => import('@/pages/user/profile'));

export const profileRoutes = (
  <Route path="profile">
    <Route index element={<MyProfileRedirect />} />

    <Route path=":username" element={<UserProfile />}>
      <Route path="overview" element={<ViewingOverview />} />
      <Route path="watched" element={<OtherUserMediaTab type="watched" />} />
      <Route path="liked" element={<OtherUserMediaTab type="liked" />} />
      <Route path="watchlist" element={<OtherUserMediaTab type="watchlist" />} />
      <Route path="collections" element={<OtherUserCollectionsTab />} />
    </Route>
  </Route>
);
