import PageHeader from '@/components/page-header';
import SimpleTabs, { FriendshipTabItem, FriendshipTabValue } from '@/components/simple-tabs';
import { LuUsers, LuSend, LuInbox, LuBan } from 'react-icons/lu';
import { useNavigate, useLocation, Outlet } from 'react-router';
import { Box } from '@chakra-ui/react';

const tabs: FriendshipTabItem[] = [
  {
    value: 'friends',
    label: 'Friends',
    icon: <LuUsers />,
  },
  {
    value: 'sent',
    label: 'Sent Requests',
    icon: <LuSend />,
  },
  {
    value: 'received',
    label: 'Received Requests',
    icon: <LuInbox />,
  },
  {
    value: 'blocked',
    label: 'Blocked',
    icon: <LuBan />,
  },
];

const Friends = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract the current tab from the pathname (e.g., /app/friends/sent -> sent)
  const pathSegments = location.pathname.split('/');
  const currentTab = (pathSegments[pathSegments.length - 1] as FriendshipTabValue) || 'friends';

  const handleTabChange = (value: FriendshipTabValue) => {
    navigate(`/app/friends/${value}`);
  };

  return (
    <>
      <PageHeader mb="4">Friends</PageHeader>
      <SimpleTabs
        tabs={tabs}
        value={currentTab}
        onValueChange={(value) => {
          handleTabChange(value as FriendshipTabValue);
        }}
      >
        <Box pt="4">
          <Outlet />
        </Box>
      </SimpleTabs>
    </>
  );
};

export default Friends;
