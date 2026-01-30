import { LuShield, LuBrain, LuDownload, LuChartBar, LuUsers } from 'react-icons/lu';

const UPCOMING_FEATURES = [
  {
    icon: LuShield,
    title: 'Privacy Controls',
    description:
      'Control who sees what. Set your watchlist, liked, and watched lists to private, friends-only, or public.',
    badge: 'Privacy',
  },

  {
    icon: LuBrain,
    title: 'AI Recommendations',
    description:
      "Bring your own AI API key or use in-browser AI. Your data stays yours, not some tech giant's training set.",
    badge: 'AI',
  },
  {
    icon: LuDownload,
    title: 'Import/Export',
    description: 'Take your data anywhere. No vendor lock-in, ever.',
    badge: 'Data',
  },
  {
    icon: LuChartBar,
    title: 'Watch Statistics',
    description: 'See your viewing habits. How many hours of your life went to TV? Find out (if you dare).',
    badge: 'Insights',
  },
  {
    icon: LuUsers,
    title: 'View Friends Activity',
    description: 'See what your friends are watching, share collections with them.',
    badge: 'Social',
  },
];

export default UPCOMING_FEATURES;
