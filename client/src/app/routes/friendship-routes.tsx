import { lazy } from 'react';
import { Navigate, Route } from 'react-router';

const Friends = lazy(() => import('@/pages/user/friendship/friends'));
const FriendshipList = lazy(() => import('@/pages/user/friendship/friends/friendship-list'));

export const friendshipRoutes = (
  <Route path="friends" element={<Friends />}>
    <Route index element={<Navigate to="friends" replace />} />
    <Route
      path="friends"
      element={<FriendshipList type="friends" emptyTitle="No friends yet" emptyDescription="Your friends will appear here" />}
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
      element={<FriendshipList type="blocked" emptyTitle="No blocked users" emptyDescription="Users you've blocked will appear here" />}
    />
  </Route>
);
