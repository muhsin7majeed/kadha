import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Heading,
  Icon,
  Menu,
  Portal,
  SimpleGrid,
  Text,
  useMediaQuery,
  VStack,
} from '@chakra-ui/react';
import { useEffect, useRef } from 'react';
import { LuGrid3X3 } from 'react-icons/lu';
import { Link, useLocation } from 'react-router';

import UtilityMenuItems from '@/components/navbar/utility-menu-items';
import { NAVIGATION_BY_ID, isRouteActive } from '@/features/navigation/navigation-registry';
import type { NavigationPreferenceItem, NavigationPreferences } from '@/features/navigation/navigation.types';

interface NavigationSurfaceProps {
  preferences: NavigationPreferences;
  preview?: boolean;
}

const itemContent = (item: NavigationPreferenceItem, boxSize = 5) => {
  const destination = NAVIGATION_BY_ID.get(item.id);
  if (!destination) return null;
  const ItemIcon = destination.icon;

  return (
    <>
      {item.display !== 'label' ? (
        <Icon boxSize={boxSize} aria-hidden>
          <ItemIcon />
        </Icon>
      ) : null}
      {item.display !== 'icon' ? (
        <Text textStyle="compactLabel" truncate maxW="full">
          {destination.label}
        </Text>
      ) : null}
    </>
  );
};

const controlStyles = {
  align: 'center',
  borderTopWidth: '2px',
  direction: 'column',
  gap: 1,
  justify: 'center',
  minH: 16,
  textDecoration: 'none',
  transition: 'background-color 0.2s ease, color 0.2s ease',
  _motionReduce: { transition: 'none' },
} as const;

interface DestinationControlProps {
  active: boolean;
  item: NavigationPreferenceItem;
  preview?: boolean;
  scrollable?: boolean;
}

const DestinationControl = ({ active, item, preview, scrollable }: DestinationControlProps) => {
  const destination = NAVIGATION_BY_ID.get(item.id);
  if (!destination || !('to' in destination)) return null;

  const styles = {
    ...controlStyles,
    flex: scrollable ? '0 0 auto' : 1,
    minW: scrollable ? '5rem' : 0,
    px: scrollable ? 3 : 1,
    borderTopColor: active ? 'brand.solid' : 'transparent',
    bg: active ? 'brand.subtle' : 'transparent',
    color: active ? 'brand.fg' : 'fg.muted',
    _hover: { bg: active ? 'brand.subtle' : 'bg.subtle', color: active ? 'brand.fg' : 'fg' },
    _focusVisible: { outline: '2px solid', outlineColor: 'brand.focusRing', outlineOffset: '-2px' },
  } as const;

  if (preview) {
    return (
      <Flex as="span" {...styles} aria-current={active ? 'page' : undefined} aria-label={item.display === 'icon' ? destination.label : undefined}>
        {itemContent(item)}
      </Flex>
    );
  }

  return (
    <Flex asChild {...styles} data-navigation-active={active ? '' : undefined}>
      <Link
        to={destination.to}
        viewTransition
        aria-current={active ? 'page' : undefined}
        aria-label={item.display === 'icon' ? destination.label : undefined}
      >
        {itemContent(item)}
      </Link>
    </Flex>
  );
};

interface NavigationMenuProps {
  active: boolean;
  item: NavigationPreferenceItem;
  omittedItems: NavigationPreferenceItem[];
  pathname: string;
  preview?: boolean;
  scrollable?: boolean;
}

const NavigationMenu = ({ active, item, omittedItems, pathname, preview, scrollable }: NavigationMenuProps) => (
  <Menu.Root positioning={{ placement: 'top-end', strategy: 'fixed', gutter: 8 }}>
    <Menu.Trigger asChild>
      <Button
        variant="ghost"
        colorPalette={active ? 'brand' : 'gray'}
        aria-label="Menu"
        aria-current={active ? 'page' : undefined}
        data-navigation-active={active ? '' : undefined}
        alignItems="center"
        borderRadius={0}
        borderTopWidth="2px"
        borderTopColor={active ? 'brand.solid' : 'transparent'}
        bg={active ? 'brand.subtle' : 'transparent'}
        color={active ? 'brand.fg' : 'fg.muted'}
        display="flex"
        flex={scrollable ? '0 0 auto' : 1}
        flexDirection="column"
        gap={1}
        h="auto"
        justifyContent="center"
        minH={16}
        minW={scrollable ? '5rem' : 0}
        px={scrollable ? 3 : 1}
        _hover={{ bg: active ? 'brand.subtle' : 'bg.subtle', color: active ? 'brand.fg' : 'fg' }}
        disabled={preview}
      >
        {itemContent(item)}
      </Button>
    </Menu.Trigger>

    <Portal disabled={preview}>
      <Menu.Positioner>
        <Menu.Content minW="52">
          {omittedItems.length > 0 ? (
            <>
              <Text px="3" py="2" color="fg.muted" textStyle="compactLabel">
                Destinations
              </Text>
              {omittedItems.map((omitted) => {
                const destination = NAVIGATION_BY_ID.get(omitted.id);
                if (!destination || !('to' in destination)) return null;
                const ItemIcon = destination.icon;

                return (
                  <Menu.Item key={destination.id} value={destination.id} asChild>
                    <Link
                      to={destination.to}
                      viewTransition
                      aria-current={isRouteActive(pathname, destination.to) ? 'page' : undefined}
                    >
                      <ItemIcon aria-hidden />
                      {destination.label}
                    </Link>
                  </Menu.Item>
                );
              })}
              <Menu.Separator />
            </>
          ) : null}
          <Menu.Item value="customize-navigation" asChild>
            <Link to="/app/settings/navigation">
              <LuGrid3X3 aria-hidden />
              Customize navigation
            </Link>
          </Menu.Item>
          <Menu.Separator />
          <Text px="3" py="2" color="fg.muted" textStyle="compactLabel">
            Utilities
          </Text>
          <UtilityMenuItems settingsPath="/app/settings" showSettings={false} />
        </Menu.Content>
      </Menu.Positioner>
    </Portal>
  </Menu.Root>
);

interface GridLauncherProps extends NavigationSurfaceProps {
  pathname: string;
  prefersReducedMotion: boolean;
}

const GridLauncher = ({ preferences, pathname, prefersReducedMotion, preview }: GridLauncherProps) => {
  const destinations = preferences.items.filter((item) => item.id !== 'menu');

  return (
    <Dialog.Root size="full" placement="center" motionPreset={prefersReducedMotion ? 'none' : 'slide-in-bottom'}>
      <Dialog.Trigger asChild>
        <Button
          aria-label="Open navigation"
          colorPalette="brand"
          rounded="full"
          boxSize="14"
          minW="14"
          shadow="lg"
          disabled={preview}
        >
          <LuGrid3X3 />
        </Button>
      </Dialog.Trigger>
      <Portal disabled={preview}>
        <Dialog.Backdrop bg="bg" />
        <Dialog.Positioner>
          <Dialog.Content bg="bg" borderRadius="0" h="100dvh" minH="100dvh" maxH="100dvh" maxW="100vw" p="0">
            <Dialog.Header
              ps={{ base: 'max(1.25rem, env(safe-area-inset-left))', md: 'max(2.5rem, env(safe-area-inset-left))' }}
              pe={{ base: 'max(1.25rem, env(safe-area-inset-right))', md: 'max(2.5rem, env(safe-area-inset-right))' }}
              pt="calc(1.5rem + env(safe-area-inset-top))"
              pb="6"
              borderBottomWidth="1px"
              borderColor="border"
            >
              <Dialog.Title asChild>
                <Heading textStyle="pageTitle">Navigate</Heading>
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body
              overflowY="auto"
              ps={{ base: 'max(1.25rem, env(safe-area-inset-left))', md: 'max(2.5rem, env(safe-area-inset-left))' }}
              pe={{ base: 'max(1.25rem, env(safe-area-inset-right))', md: 'max(2.5rem, env(safe-area-inset-right))' }}
              pt={{ base: 6, md: 10 }}
              pb={{ base: 'calc(1.5rem + env(safe-area-inset-bottom))', md: 'calc(2.5rem + env(safe-area-inset-bottom))' }}
            >
              <SimpleGrid columns={{ base: 2, sm: 3, lg: 5 }} gap={{ base: 3, md: 5 }} maxW="6xl" mx="auto">
                {destinations.map((item) => {
                  const destination = NAVIGATION_BY_ID.get(item.id);
                  if (!destination || !('to' in destination)) return null;
                  const DestinationIcon = destination.icon;

                  return (
                    <Dialog.CloseTrigger key={item.id} asChild>
                      <VStack
                        asChild
                        align="stretch"
                        justify="space-between"
                        minH={{ base: '8rem', md: '11rem' }}
                        p={{ base: 4, md: 5 }}
                        bg="brand.subtle"
                        color="brand.fg"
                        borderWidth="1px"
                        borderColor="brand.muted"
                        rounded="xl"
                        textDecoration="none"
                        transition="transform 0.18s ease, background-color 0.18s ease"
                        _hover={{ bg: 'brand.muted', transform: 'translateY(-2px)' }}
                        _focusVisible={{ outline: '3px solid', outlineColor: 'brand.focusRing' }}
                        _motionReduce={{ transition: 'none', _hover: { transform: 'none' } }}
                      >
                        <Link
                          to={destination.to}
                          viewTransition
                          aria-current={isRouteActive(pathname, destination.to) ? 'page' : undefined}
                          aria-label={item.display === 'icon' ? destination.label : undefined}
                        >
                          {item.display !== 'label' ? <DestinationIcon size={28} aria-hidden /> : <Box />}
                          {item.display !== 'icon' ? (
                            <Text textStyle="cardTitle">{destination.label}</Text>
                          ) : null}
                        </Link>
                      </VStack>
                    </Dialog.CloseTrigger>
                  );
                })}
                <Dialog.CloseTrigger asChild>
                  <VStack
                    asChild
                    align="stretch"
                    justify="space-between"
                    minH={{ base: '8rem', md: '11rem' }}
                    p={{ base: 4, md: 5 }}
                    bg="bg.subtle"
                    borderWidth="1px"
                    borderColor="border"
                    rounded="xl"
                    textDecoration="none"
                    _hover={{ bg: 'bg.muted' }}
                  >
                    <Link to="/app/settings/navigation">
                      <LuGrid3X3 size={28} aria-hidden />
                      <Text textStyle="cardTitle">Customize navigation</Text>
                    </Link>
                  </VStack>
                </Dialog.CloseTrigger>
              </SimpleGrid>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton
                position="absolute"
                top="calc(1.25rem + env(safe-area-inset-top))"
                right={{ base: 'max(1.25rem, env(safe-area-inset-right))', md: 'max(2.5rem, env(safe-area-inset-right))' }}
                aria-label="Close navigation"
              />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export const NavigationSurface = ({ preferences, preview = false }: NavigationSurfaceProps) => {
  const { pathname } = useLocation();
  const [prefersReducedMotion] = useMediaQuery(['(prefers-reduced-motion: reduce)'], { fallback: [false] });
  const scrollRef = useRef<HTMLDivElement>(null);
  const visibleItems = preferences.items.filter((item) => item.visible);
  const omittedItems = preferences.items.filter((item) => !item.visible && item.id !== 'menu');
  const isMenuActive = omittedItems.some((item) => {
    const destination = NAVIGATION_BY_ID.get(item.id);
    return destination && 'to' in destination && isRouteActive(pathname, destination.to);
  });

  useEffect(() => {
    if (preferences.layout !== 'scrollable' || preview) return;
    scrollRef.current?.querySelector<HTMLElement>('[data-navigation-active]')?.scrollIntoView?.({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [pathname, preferences.layout, prefersReducedMotion, preview]);

  if (preferences.layout === 'grid') {
    if (preview) {
      return (
        <SimpleGrid columns={{ base: 2, sm: 3 }} gap="2" p="4" aria-label="Navigation preview">
          {preferences.items
            .filter((item) => item.id !== 'menu')
            .map((item) => (
              <VStack
                key={item.id}
                align="stretch"
                justify="space-between"
                minH="6rem"
                p="3"
                bg="brand.subtle"
                color="brand.fg"
                borderWidth="1px"
                borderColor="brand.muted"
                rounded="lg"
                aria-label={item.display === 'icon' ? NAVIGATION_BY_ID.get(item.id)?.label : undefined}
              >
                {itemContent(item, 6)}
              </VStack>
            ))}
        </SimpleGrid>
      );
    }

    return (
      <Flex
        position="fixed"
        bottom="calc(1rem + env(safe-area-inset-bottom))"
        right={{ base: 4, md: 6 }}
        justify="center"
        zIndex={2}
      >
        <GridLauncher
          preferences={preferences}
          pathname={pathname}
          prefersReducedMotion={prefersReducedMotion}
        />
      </Flex>
    );
  }

  const scrollable = preferences.layout === 'scrollable';

  return (
    <Box
      as="nav"
      aria-label={preview ? 'Navigation preview' : 'Primary navigation'}
      position={preview ? 'relative' : 'fixed'}
      bottom={preview ? undefined : 0}
      left={preview ? undefined : 0}
      right={preview ? undefined : 0}
      zIndex={2}
      bg="bg"
      borderTopWidth="1px"
      borderColor="border"
      pb={preview ? 0 : 'env(safe-area-inset-bottom)'}
      px={preview ? 0 : { base: 0, md: 4 }}
    >
      <Box w="full" maxW={{ base: 'full', md: '3xl' }} mx="auto">
        <Flex
          ref={scrollRef}
          data-layout={preferences.layout}
          align="stretch"
          overflowX={scrollable ? 'auto' : 'visible'}
          css={scrollable ? { scrollbarWidth: 'none', scrollSnapType: 'x proximity' } : undefined}
          maskImage={scrollable ? 'linear-gradient(to right, transparent, black 1rem, black calc(100% - 1rem), transparent)' : undefined}
        >
          {visibleItems.map((item) => {
            if (item.id === 'menu') {
              return (
                <NavigationMenu
                  key={item.id}
                  active={isMenuActive}
                  item={item}
                  omittedItems={omittedItems}
                  pathname={pathname}
                  preview={preview}
                  scrollable={scrollable}
                />
              );
            }
            const destination = NAVIGATION_BY_ID.get(item.id);
            const active = destination && 'to' in destination ? isRouteActive(pathname, destination.to) : false;
            return (
              <DestinationControl
                key={item.id}
                active={active}
                item={item}
                preview={preview}
                scrollable={scrollable}
              />
            );
          })}
        </Flex>
      </Box>
    </Box>
  );
};
