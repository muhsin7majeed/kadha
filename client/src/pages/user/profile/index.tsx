import { Box, Card, Skeleton, Stack } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import ErrorState from '@/components/info-states/error-state';
import { useParams } from 'react-router';
import OtherUserData from './other-user-data';
import useUserProfile from '@/features/user/api/use-user-profile';
import ProfileHeader from './profile-header';
import LockedProfileState from './locked-profile-state';
import { useAuth } from '@/features/auth/use-auth';

type URLParams = {
  username?: string;
};

const ProfileLoadingState = () => (
  <Stack gap="5" maxW="3xl">
    <Card.Root variant="outline">
      <Card.Body>
        <Stack gap="4">
          <Skeleton height="8" width="48" />
          <Skeleton height="4" width="full" />
          <Skeleton height="10" width="full" />
        </Stack>
      </Card.Body>
    </Card.Root>

    <Card.Root variant="outline">
      <Card.Body>
        <Stack gap="4">
          <Skeleton height="7" width="36" />
          <Skeleton height="16" width="full" />
          <Skeleton height="16" width="full" />
          <Skeleton height="16" width="full" />
        </Stack>
      </Card.Body>
    </Card.Root>
  </Stack>
);

const UserProfile = () => {
  const { username } = useParams<URLParams>();
  const auth = useAuth();

  const isMyProfile = username ? username.toLocaleLowerCase() === auth.user?.username?.toLocaleLowerCase() : true;
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile(username || '');

  return (
    <Box>
      <PageHeader
        isFetching={isProfileFetching}
        subHeader={
          isMyProfile
            ? 'Review your profile and the activity sections connected to it.'
            : 'Review visible activity and connection options for this user.'
        }
        mb="5"
      >
        {isMyProfile ? 'My Profile' : `${profile?.username ?? username}'s Profile`}
      </PageHeader>

      <Box>
        {isProfileLoading ? (
          <ProfileLoadingState />
        ) : profileError ? (
          <ErrorState title="Error" description="Error fetching user profile" onRetry={refetchProfile} />
        ) : profile ? (
          <Stack gap="5">
            <ProfileHeader profile={profile} isOwner={isMyProfile} />

            {profile.access.canView ? (
              <OtherUserData username={username!} profile={profile} isOwner={isMyProfile} />
            ) : (
              <LockedProfileState lockedReason={profile.access.lockedReason} />
            )}
          </Stack>
        ) : (
          <ErrorState title="Not found" description="User profile not found" onRetry={refetchProfile} />
        )}
      </Box>
    </Box>
  );
};

export default UserProfile;
