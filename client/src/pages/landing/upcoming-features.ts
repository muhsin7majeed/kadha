import { LuUsers, LuShield, LuLock, LuBrain, LuServer, LuDownload, LuChartBar, LuSparkles } from 'react-icons/lu';

const UPCOMING_FEATURES = [
  {
    icon: LuUsers,
    title: 'Friends System',
    description: "Connect with friends and see what they're watching. Share recommendations the old-fashioned way.",
    badge: 'Social',
  },
  {
    icon: LuShield,
    title: 'Privacy Controls',
    description:
      'Control who sees what. Set your watchlist, liked, and watched lists to private, friends-only, or public.',
    badge: 'Privacy',
  },
  {
    icon: LuLock,
    title: 'Profile Privacy',
    description: 'Go full ghost mode with a private profile, or let the world see your taste.',
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
    icon: LuServer,
    title: 'Self-Hosting',
    description: "Don't trust us? Host it yourself. Docker makes it easy. Your data, your server, your rules.",
    badge: 'Core',
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
    icon: LuSparkles,
    title: 'Custom Collections',
    description: 'Create themed lists. "Comfort Movies", "Date Night", "When I\'m Sick" — you name it.',
    badge: 'Organization',
  },
];

export default UPCOMING_FEATURES;
