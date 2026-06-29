import { LuBrain, LuChartBar, LuDownload, LuLink, LuMapPin, LuSparkles, LuUsers } from 'react-icons/lu';

const UPCOMING_FEATURES = [
  {
    icon: LuSparkles,
    title: 'TMDB Recommendations',
    description: 'Find similar movies and shows from TMDB based on what you already like or watched.',
    badge: 'Recommendations',
  },
  {
    icon: LuBrain,
    title: 'AI Recommendations',
    description:
      "Bring your own AI API key or use in-browser AI. Your data stays yours, not some tech giant's training set.",
    badge: 'AI',
  },
  {
    icon: LuUsers,
    title: 'Friends Activity',
    description: 'See what friends are watching and discover recommendations from people you trust.',
    badge: 'Social',
  },
  {
    icon: LuLink,
    title: 'Public Collection Links',
    description: 'Share selected collections with public links while keeping private lists private.',
    badge: 'Sharing',
  },
  {
    icon: LuDownload,
    title: 'Import/Export',
    description: 'Bring data in, export everything out, and avoid vendor lock-in.',
    badge: 'Data',
  },
  {
    icon: LuChartBar,
    title: 'Watch Statistics',
    description: 'See your viewing habits. How many hours of your life went to TV? Find out (if you dare).',
    badge: 'Insights',
  },
  {
    icon: LuMapPin,
    title: 'Platform Availability',
    description: 'Show where a movie or show is available to stream when provider data is wired in.',
    badge: 'Discovery',
  },
];

export default UPCOMING_FEATURES;
