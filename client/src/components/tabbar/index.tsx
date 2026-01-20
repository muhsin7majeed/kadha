import { Tabs } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router';
import { LuBookmark, LuCheck, LuFolder, LuHeart, LuHouse } from 'react-icons/lu';

const TABS = [
  {
    label: 'Home',
    icon: <LuHouse size={24} />,
    to: '/app',
  },
  {
    label: 'Watchlist',
    icon: <LuBookmark size={24} />,
    to: '/app/watchlist',
  },
  {
    label: 'Watched',
    icon: <LuCheck size={24} />,
    to: '/app/watched',
  },
  {
    label: 'Liked',
    icon: <LuHeart size={24} />,
    to: '/app/liked',
  },
  {
    label: 'Collections',
    icon: <LuFolder size={24} />,
    to: '/app/collections',
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
                title={tab.label}
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
