import type { IconType } from 'react-icons';
import {
  LuActivity,
  LuBookmark,
  LuCheck,
  LuEllipsis,
  LuFolder,
  LuHeart,
  LuHouse,
  LuListChecks,
  LuSettings,
  LuUsers,
  LuWandSparkles,
} from 'react-icons/lu';

import type { NavigationItemId } from './navigation.types';

export interface NavigationDestination {
  id: Exclude<NavigationItemId, 'menu'>;
  label: string;
  icon: IconType;
  to: string;
}

export interface NavigationMenuItem {
  id: 'menu';
  label: string;
  icon: IconType;
}

export type NavigationRegistryItem = NavigationDestination | NavigationMenuItem;

export const NAVIGATION_REGISTRY: NavigationRegistryItem[] = [
  { id: 'home', label: 'Home', icon: LuHouse, to: '/app' },
  { id: 'recommendations', label: 'For You', icon: LuWandSparkles, to: '/app/recommendations' },
  { id: 'watchlist', label: 'Watchlist', icon: LuBookmark, to: '/app/watchlist' },
  { id: 'in-progress', label: 'Progress', icon: LuListChecks, to: '/app/in-progress' },
  { id: 'collections', label: 'Collections', icon: LuFolder, to: '/app/collections' },
  { id: 'activity', label: 'Activity', icon: LuActivity, to: '/app/activity' },
  { id: 'watched', label: 'Watched', icon: LuCheck, to: '/app/watched' },
  { id: 'liked', label: 'Liked', icon: LuHeart, to: '/app/liked' },
  { id: 'friends', label: 'Friends', icon: LuUsers, to: '/app/friends' },
  { id: 'settings', label: 'Settings', icon: LuSettings, to: '/app/settings' },
  { id: 'menu', label: 'Menu', icon: LuEllipsis },
];

export const NAVIGATION_BY_ID = new Map(NAVIGATION_REGISTRY.map((item) => [item.id, item]));

export const isRouteActive = (pathname: string, to: string) =>
  to === '/app' ? pathname === to : pathname === to || pathname.startsWith(`${to}/`);
