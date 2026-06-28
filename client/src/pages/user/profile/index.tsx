import { useGetMe } from '@/features/user/api/use-get-me';
import { Box, Stack } from '@chakra-ui/react';
import PageHeader from '@/components/page-header';
import CommonSpinner from '@/components/spinners/common-spinner';
import ErrorState from '@/components/info-states/error-state';
import { useParams } from 'react-router';
import { useAuthAtom } from '@/atoms/auth-atom';
import OtherUserData from './other-user-data';
import { capitalize } from '@/utils/capitalize';
import useUserProfile from '@/features/user/api/use-user-profile';
import MyProfileSettings from './my-profile-settings';
import OtherUserProfileHeader from './other-user-profile-header';
import LockedProfileState from './locked-profile-state';

type URLParams = {
  username?: string;
};

const UserProfile = () => {
  const { username } = useParams<URLParams>();
  const [auth] = useAuthAtom();

  const isMyProfile = username ? username.toLocaleLowerCase() === auth.user?.username?.toLocaleLowerCase() : true;

  const { data: me, isLoading, isFetching, error, refetch } = useGetMe({ enabled: isMyProfile });
  const {
    data: profile,
    isLoading: isProfileLoading,
    isFetching: isProfileFetching,
    error: profileError,
    refetch: refetchProfile,
  } = useUserProfile(username || '');

  return (
    <Box>
      <PageHeader isFetching={isMyProfile ? isFetching : isProfileFetching} mb="4">
        {isMyProfile ? 'My' : `${capitalize(username!)}'s`} Profile
      </PageHeader>

      <Box>
        {isMyProfile ? (
          isLoading ? (
            <CommonSpinner />
          ) : error ? (
            <ErrorState title="Error" description="Error fetching user profile" onRetry={refetch} />
          ) : me ? (
            <MyProfileSettings me={me} />
          ) : (
            <ErrorState title="Not found" description="User profile not found" onRetry={refetch} />
          )
        ) : isProfileLoading ? (
          <CommonSpinner />
        ) : profileError ? (
          <ErrorState title="Error" description="Error fetching user profile" onRetry={refetchProfile} />
        ) : profile ? (
          <Stack gap="5">
            <OtherUserProfileHeader profile={profile} />

            {profile.access.canView ? (
              <OtherUserData username={username!} profile={profile} />
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
