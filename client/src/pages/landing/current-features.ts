import { LuHeart, LuBookmark, LuCheck, LuClapperboard, LuFilter, LuSparkles, LuServer } from 'react-icons/lu';

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
    title: 'Filter by Type',
    description: 'Movies, TV shows, or both. You decide what shows up.',
  },
  {
    icon: LuClapperboard,
    title: 'Trending Content',
    description: "See what's popular right now. Stay in the loop without the algorithm manipulation.",
  },
  {
    icon: LuSparkles,
    title: 'Custom Collections',
    description: 'Create themed lists. "Comfort Movies", "Date Night", "When I\'m Sick" — you name it.',
    badge: 'Organization',
  },
  {
    icon: LuServer,
    title: 'Self-Hosting',
    description: "Don't trust us? Host it yourself. Docker makes it easy. Your data, your server, your rules.",
    badge: 'Core',
  },
];

export default CURRENT_FEATURES;
