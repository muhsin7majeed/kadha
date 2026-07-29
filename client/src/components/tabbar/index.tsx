import { Box, Button, Flex, Icon, Menu, Portal, Text } from '@chakra-ui/react';
import type { IconType } from 'react-icons';
import { LuActivity, LuBookmark, LuCheck, LuEllipsis, LuFolder, LuHeart, LuHouse, LuListChecks } from 'react-icons/lu';
import { Link, useLocation } from 'react-router';

interface NavigationItem {
  label: string;
  icon: IconType;
  to: string;
}

const PRIMARY_ITEMS: NavigationItem[] = [
  {
    label: 'Home',
    icon: LuHouse,
    to: '/app',
  },
  {
    label: 'Watchlist',
    icon: LuBookmark,
    to: '/app/watchlist',
  },
  {
    label: 'Progress',
    icon: LuListChecks,
    to: '/app/in-progress',
  },
  {
    label: 'Collections',
    icon: LuFolder,
    to: '/app/collections',
  },
];

const MORE_ITEMS: NavigationItem[] = [
  {
    label: 'Activity',
    icon: LuActivity,
    to: '/app/activity',
  },
  {
    label: 'Watched',
    icon: LuCheck,
    to: '/app/watched',
  },
  {
    label: 'Liked',
    icon: LuHeart,
    to: '/app/liked',
  },
];

const isRouteActive = (pathname: string, to: string) =>
  to === '/app' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);

interface NavigationLinkProps {
  active: boolean;
  item: NavigationItem;
}

const NavigationLink = ({ active, item }: NavigationLinkProps) => {
  const ItemIcon = item.icon;

  return (
    <Flex
      asChild
      align="center"
      direction="column"
      flex={1}
      gap={1}
      justify="center"
      minH={16}
      minW={0}
      borderTopWidth="2px"
      borderTopColor={active ? 'brand.solid' : 'transparent'}
      bg={active ? 'brand.subtle' : 'transparent'}
      color={active ? 'brand.fg' : 'fg.muted'}
      textDecoration="none"
      transition="background-color 0.2s ease, color 0.2s ease"
      _hover={{ bg: active ? 'brand.subtle' : 'bg.subtle', color: active ? 'brand.fg' : 'fg' }}
      _focusVisible={{ outline: '2px solid', outlineColor: 'brand.focusRing', outlineOffset: '-2px' }}
    >
      <Link to={item.to} viewTransition aria-current={active ? 'page' : undefined}>
        <Icon boxSize={5}>
          <ItemIcon />
        </Icon>
        <Text textStyle="compactLabel" truncate maxW="full">
          {item.label}
        </Text>
      </Link>
    </Flex>
  );
};

const TabBar = () => {
  const { pathname } = useLocation();
  const isMoreActive = MORE_ITEMS.some((item) => isRouteActive(pathname, item.to));

  return (
    <Box as="nav" aria-label="Primary navigation" w="full" maxW={{ base: 'full', md: '3xl' }} mx="auto">
      <Flex align="stretch">
        {PRIMARY_ITEMS.map((item) => (
          <NavigationLink key={item.to} item={item} active={isRouteActive(pathname, item.to)} />
        ))}

        <Menu.Root positioning={{ placement: 'top-end', strategy: 'fixed', gutter: 8 }}>
          <Menu.Trigger asChild>
            <Button
              variant="ghost"
              colorPalette={isMoreActive ? 'brand' : 'gray'}
              aria-label="More navigation options"
              alignItems="center"
              borderRadius={0}
              borderTopWidth="2px"
              borderTopColor={isMoreActive ? 'brand.solid' : 'transparent'}
              bg={isMoreActive ? 'brand.subtle' : 'transparent'}
              color={isMoreActive ? 'brand.fg' : 'fg.muted'}
              display="flex"
              flex={1}
              flexDirection="column"
              gap={1}
              h="auto"
              justifyContent="center"
              minH={16}
              minW={0}
              px={1}
              _hover={{ bg: isMoreActive ? 'brand.subtle' : 'bg.subtle', color: isMoreActive ? 'brand.fg' : 'fg' }}
            >
              <Icon boxSize={5}>
                <LuEllipsis />
              </Icon>
              <Text textStyle="compactLabel">More</Text>
            </Button>
          </Menu.Trigger>

          <Portal>
            <Menu.Positioner>
              <Menu.Content minW="44">
                {MORE_ITEMS.map((item) => {
                  const ItemIcon = item.icon;

                  return (
                    <Menu.Item key={item.to} value={item.to} asChild>
                      <Link
                        to={item.to}
                        viewTransition
                        aria-current={isRouteActive(pathname, item.to) ? 'page' : undefined}
                      >
                        <ItemIcon />
                        {item.label}
                      </Link>
                    </Menu.Item>
                  );
                })}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </Box>
  );
};

export default TabBar;
