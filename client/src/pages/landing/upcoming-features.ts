import { LuBrain, LuChartBar, LuDownload, LuSparkles, LuUsers } from 'react-icons/lu';

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
    icon: LuDownload,
    title: 'Data Import',
    description:
      'Bring your existing history into Kadha with validation, preview, idempotency, and conflict handling.',
    badge: 'Data',
  },
  {
    icon: LuChartBar,
    title: 'Watch Trends',
    description: 'Add watch-history totals, time-watched estimates, and deeper TV viewing-pattern insights.',
    badge: 'Insights',
  },
];

export default UPCOMING_FEATURES;
