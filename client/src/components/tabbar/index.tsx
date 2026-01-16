import { AiFillCheckCircle, AiFillHeart } from 'react-icons/ai';
import { Tabs } from '@chakra-ui/react';
import { AiOutlineHome } from 'react-icons/ai';
import { Link, useLocation } from 'react-router';
import { TbListCheck } from 'react-icons/tb';

const TABS = [
  {
    label: 'Home',
    icon: <AiOutlineHome size={24} />,
    to: '/app',
  },
  {
    label: 'Watchlist',
    icon: <TbListCheck size={24} />,
    to: '/app/watchlist',
  },
  {
    label: 'Watched',
    icon: <AiFillCheckCircle size={24} />,
    to: '/app/watched',
  },
  {
    label: 'Liked',
    icon: <AiFillHeart size={24} />,
    to: '/app/liked',
  },
];

const TabBar = () => {
  const activeTab = useLocation().pathname;

  return (
    <>
      <Tabs.Root variant="enclosed" fitted defaultValue={activeTab} mx="auto" w="sm">
        <Tabs.List borderRadius="full">
          {TABS.map((tab, index) => {
            const isFirst = index === 0;
            const isLast = index === TABS.length - 1;

            return (
              <Tabs.Trigger
                key={tab.label}
                value={tab.to}
                asChild
                borderLeftRadius={isFirst ? 'full' : 'none'}
                borderRightRadius={isLast ? 'full' : 'none'}
              >
                <Link to={tab.to}>{tab.icon}</Link>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs.Root>
    </>
  );
};

export default TabBar;
