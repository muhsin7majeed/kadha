import { Icon, Tabs } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router';
import { LuBookmark, LuCheck, LuFolder, LuHeart, LuHouse } from 'react-icons/lu';

const TABS = [
  {
    label: 'Home',
    icon: <LuHouse />,
    to: '/app',
  },
  {
    label: 'Watchlist',
    icon: <LuBookmark />,
    to: '/app/watchlist',
  },
  {
    label: 'Watched',
    icon: <LuCheck />,
    to: '/app/watched',
  },
  {
    label: 'Liked',
    icon: <LuHeart />,
    to: '/app/liked',
  },
  {
    label: 'Collections',
    icon: <LuFolder />,
    to: '/app/collections',
  },
];

const TabBar = () => {
  const activeTab = useLocation().pathname;

  return (
    <>
      <Tabs.Root variant="enclosed" fitted defaultValue={activeTab} mx="auto" w="full">
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
                <Link to={tab.to}>
                  <Icon size="lg" color="orange.500">
                    {tab.icon}
                  </Icon>
                </Link>
              </Tabs.Trigger>
            );
          })}
        </Tabs.List>
      </Tabs.Root>
    </>
  );
};

export default TabBar;
