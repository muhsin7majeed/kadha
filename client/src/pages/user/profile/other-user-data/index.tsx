import SimpleTabs, { TabItem } from '@/components/simple-tabs';
import { Box } from '@chakra-ui/react';
import { LuBookmark, LuCheck, LuFolder, LuHeart } from 'react-icons/lu';
import { Outlet, useNavigate } from 'react-router';
import { useLocation } from 'react-router';
import { UserProfileResponse } from '@/features/user/user.types';
import { useEffect } from 'react';

export type OtherUserDataTabs = 'watched' | 'liked' | 'collections' | 'watchlist';

const tabs: TabItem<OtherUserDataTabs>[] = [
  {
    value: 'watched',
    label: 'Watched',
    icon: <LuCheck />,
  },
  {
    value: 'liked',
    label: 'Liked',
    icon: <LuHeart />,
  },
  {
    value: 'watchlist',
    label: 'Watchlist',
    icon: <LuBookmark />,
  },
  {
    value: 'collections',
    label: 'Collections',
    icon: <LuFolder />,
  },
];

interface OtherUserDataProps {
  username: string;
  profile: UserProfileResponse;
}

const OtherUserData: React.FC<OtherUserDataProps> = ({ username, profile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const visibleTabs = tabs.filter((tab) => profile.sections[tab.value]);

  // Extract the current tab from the pathname (e.g., /app/profile/username/watched -> sent)
  const pathSegments = location.pathname.split('/');
  const currentTab = (pathSegments[pathSegments.length - 1] as OtherUserDataTabs) || 'watched';
  const hasCurrentTab = visibleTabs.some((tab) => tab.value === currentTab);

  const handleTabChange = (value: OtherUserDataTabs) => {
    navigate(`/app/profile/${username}/${value}`);
  };

  useEffect(() => {
    if (visibleTabs.length > 0 && !hasCurrentTab) {
      navigate(`/app/profile/${username}/${visibleTabs[0].value}`, { replace: true });
    }
  }, [hasCurrentTab, navigate, username, visibleTabs]);

  return (
    <>
      <SimpleTabs
        triggerType="link"
        tabs={visibleTabs}
        value={hasCurrentTab ? currentTab : visibleTabs[0]?.value}
        onValueChange={(value) => {
          handleTabChange(value as OtherUserDataTabs);
        }}
      >
        <Box pt="4">
          <Outlet />
        </Box>
      </SimpleTabs>
    </>
  );
};

export default OtherUserData;
