import {
  LuBookmark,
  LuBell,
  LuCheck,
  LuClapperboard,
  LuFilter,
  LuHeart,
  LuLock,
  LuSearch,
  LuSparkles,
  LuServer,
  LuUsers,
} from 'react-icons/lu';

const CURRENT_FEATURES = [
  {
    icon: LuBookmark,
    title: 'Watchlist',
    description: 'Keep track of stuff you want to watch. Simple as that.',
  },
  {
    icon: LuHeart,
    title: 'Liked',
    description: 'Save your favorites. Build your own hall of fame.',
  },
  {
    icon: LuCheck,
    title: 'Watched',
    description: "Mark what you've seen. Never forget if you watched that movie or not.",
  },
  {
    icon: LuFilter,
    title: 'Movie and TV Control',
    description: 'Browse movies and TV shows separately so each media type gets the right details and actions.',
    badge: 'Discovery',
  },
  {
    icon: LuClapperboard,
    title: 'Trending Content',
    description: "See what's popular right now, including dedicated movie and TV discovery sections.",
    badge: 'Discovery',
  },
  {
    icon: LuSearch,
    title: 'Global Search',
    description: 'Search movies, TV shows, and users from one dialog with paginated results.',
    badge: 'Discovery',
  },
  {
    icon: LuSparkles,
    title: 'Custom Collections',
    description: 'Create themed lists like "Comfort Movies", "Date Night", or anything else you want to organize.',
    badge: 'Organization',
  },
  {
    icon: LuBell,
    title: 'Notifications',
    description: 'Track friendship requests and social updates with unread counts and mark-as-read controls.',
    badge: 'Social',
  },
  {
    icon: LuServer,
    title: 'Self-Hosting',
    description: "Don't trust us? Host it yourself. Docker makes it easy. Your data, your server, your rules.",
    badge: 'Core',
  },
  {
    icon: LuUsers,
    title: 'Friends System',
    description: 'Find users, send friend requests, accept or reject requests, and block accounts when needed.',
    badge: 'Social',
  },
  {
    icon: LuLock,
    title: 'Privacy Controls',
    description: 'Control who can see your profile, watched list, liked list, watchlist, and collections.',
    badge: 'Privacy',
  },
];

export default CURRENT_FEATURES;
