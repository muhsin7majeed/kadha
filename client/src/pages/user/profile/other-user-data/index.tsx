import SimpleTabs, { TabItem } from '@/components/simple-tabs';
import { Box } from '@chakra-ui/react';
import { LuBookmark, LuCheck, LuFolder, LuHeart } from 'react-icons/lu';
import { Outlet, useNavigate } from 'react-router';
import { useLocation } from 'react-router';

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
}

const OtherUserData: React.FC<OtherUserDataProps> = ({ username }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the current tab from the pathname (e.g., /app/profile/username/watched -> sent)
  const pathSegments = location.pathname.split('/');
  const currentTab = (pathSegments[pathSegments.length - 1] as OtherUserDataTabs) || 'watched';

  const handleTabChange = (value: OtherUserDataTabs) => {
    navigate(`/app/profile/${username}/${value}`);
  };

  return (
    <>
      <SimpleTabs
        triggerType="link"
        tabs={tabs}
        value={currentTab}
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
