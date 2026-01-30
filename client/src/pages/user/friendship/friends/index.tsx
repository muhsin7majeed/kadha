import PageHeader from '@/components/page-header';
import SimpleTabs, { FriendshipTabItem, FriendshipTabValue } from '@/components/simple-tabs';
import { LuUsers, LuSend, LuInbox, LuBan } from 'react-icons/lu';
import FriendshipList from './friendship-list';
import { useNavigate, useParams } from 'react-router';

const tabs: FriendshipTabItem[] = [
  {
    value: 'friends',
    label: 'Friends',
    icon: <LuUsers />,
    content: (
      <FriendshipList type="friends" emptyTitle="No friends yet" emptyDescription="Your friends will appear here" />
    ),
  },
  {
    value: 'sent',
    label: 'Sent Requests',
    icon: <LuSend />,
    content: (
      <FriendshipList
        type="sent"
        emptyTitle="No sent requests"
        emptyDescription="Friend requests you've sent will appear here"
      />
    ),
  },
  {
    value: 'received',
    label: 'Received Requests',
    icon: <LuInbox />,
    content: (
      <FriendshipList
        type="received"
        emptyTitle="No pending requests"
        emptyDescription="Friend requests you've received will appear here"
      />
    ),
  },
  {
    value: 'blocked',
    label: 'Blocked',
    icon: <LuBan />,
    content: (
      <FriendshipList
        type="blocked"
        emptyTitle="No blocked users"
        emptyDescription="Users you've blocked will appear here"
      />
    ),
  },
];

const Friends = () => {
  const { tab = 'friends' } = useParams<{ tab?: FriendshipTabValue }>();

  const navigate = useNavigate();

  const handleTabChange = (value: FriendshipTabValue) => {
    navigate(`/app/friends/${value}`);
  };

  return (
    <>
      <PageHeader mb="4">Friends</PageHeader>
      <SimpleTabs
        tabs={tabs}
        value={tab}
        onValueChange={(value) => {
          handleTabChange(value as FriendshipTabValue);
        }}
      />
    </>
  );
};

export default Friends;
