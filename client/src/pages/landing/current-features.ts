import { LuBookmark, LuCheck, LuClapperboard, LuHeart, LuLock, LuSparkles, LuServer, LuUsers } from 'react-icons/lu';

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
    icon: LuClapperboard,
    title: 'Trending Content',
    description: "See what's popular right now, so you are not missing out.",
    badge: 'Discovery',
  },
  {
    icon: LuSparkles,
    title: 'Custom Collections',
    description: 'Create themed lists like "Comfort Movies", "Date Night", or anything else you want to organize.',
    badge: 'Organization',
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
    description: 'Find users, become friends, share your favorites.',
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
