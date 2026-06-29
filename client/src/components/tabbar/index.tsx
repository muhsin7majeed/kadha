import { Box, Icon, Tabs } from '@chakra-ui/react';
import { Link, useLocation } from 'react-router';
import { LuActivity, LuBookmark, LuCheck, LuFolder, LuHeart, LuHouse } from 'react-icons/lu';

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
    label: 'Activity',
    icon: <LuActivity />,
    to: '/app/activity',
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
      <Tabs.Root variant="enclosed" defaultValue={activeTab} mx="auto" w="max-content" maxW="calc(100vw - var(--chakra-spacing-4))">
        <Box overflowX="auto" maxW="full">
          <Tabs.List borderRadius="full" minW="fit-content" whiteSpace="nowrap">
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
                  flexShrink={0}
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
        </Box>
      </Tabs.Root>
    </>
  );
};

export default TabBar;
