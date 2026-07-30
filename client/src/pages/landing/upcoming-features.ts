import { LuBrain, LuChartBar, LuDownload, LuLink, LuSparkles, LuUsers } from 'react-icons/lu';

const UPCOMING_FEATURES = [
  {
    icon: LuSparkles,
    title: 'TMDB Recommendations',
    description: 'Optionally find similar movies and shows from TMDB using titles you choose to include.',
    badge: 'Recommendations',
  },
  {
    icon: LuBrain,
    title: 'AI Recommendations',
    description:
      'Evaluate local or bring-your-own-provider recommendations, with a clear disclosure before any data leaves Kadha.',
    badge: 'AI',
  },
  {
    icon: LuUsers,
    title: 'Friends Activity',
    description: 'See only the activity friends choose to share and discover recommendations from people you trust.',
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
    title: 'Data Import',
    description:
      'Bring your existing history into Kadha. A JSON export is available today; episode-history export is still planned.',
    badge: 'Data',
  },
  {
    icon: LuChartBar,
    title: 'Watch Statistics',
    description: 'See your viewing habits. How many hours of your life went to TV? Find out (if you dare).',
    badge: 'Insights',
  },
];

export default UPCOMING_FEATURES;
