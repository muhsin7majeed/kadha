import { LuSearch, LuHeart, LuBookmark, LuCheck, LuClapperboard, LuFilter } from 'react-icons/lu';

const CURRENT_FEATURES = [
  {
    icon: LuSearch,
    title: 'Search & Discover',
    description:
      "Find movies and TV shows from TMDB's massive database. No more endless scrolling through streaming apps.",
  },
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
];

export default CURRENT_FEATURES;
