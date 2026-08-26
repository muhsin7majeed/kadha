import { lazy } from 'react';
import { Route } from 'react-router';

const Landing = lazy(() => import('@/pages/landing'));
const OtherUserCollectionsTab = lazy(() => import('@/pages/user/profile/other-user-data/collections-tab'));
const OtherUserMediaTab = lazy(() => import('@/pages/user/profile/other-user-data/media-tab'));
const MediaDetails = lazy(() => import('@/pages/media-details'));
const Privacy = lazy(() => import('@/pages/privacy'));
const PublicCollection = lazy(() => import('@/pages/public-collection'));
const PublicReadLayout = lazy(() => import('@/components/public-read-layout'));
const Settings = lazy(() => import('@/pages/settings'));
const Terms = lazy(() => import('@/pages/terms'));
const UserProfile = lazy(() => import('@/pages/user/profile'));

export const publicRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="settings" element={<Settings />} />
    <Route path="terms" element={<Terms />} />

    <Route element={<PublicReadLayout />}>
      <Route path="u/:username" element={<UserProfile />}>
        <Route path="watched" element={<OtherUserMediaTab type="watched" />} />
        <Route path="liked" element={<OtherUserMediaTab type="liked" />} />
        <Route path="watchlist" element={<OtherUserMediaTab type="watchlist" />} />
        <Route path="collections" element={<OtherUserCollectionsTab />} />
      </Route>
      <Route path="media/:mediaType/:id" element={<MediaDetails />} />
      <Route path="share/collections/:id" element={<PublicCollection />} />
    </Route>
  </>
);
