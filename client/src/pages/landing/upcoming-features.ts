import { LuBrain, LuChartBar, LuDownload, LuUsers } from 'react-icons/lu';

const UPCOMING_FEATURES = [
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
    title: 'Letterboxd & Trakt Imports',
    description: 'Bring your existing watch history into Kadha from supported tracking services.',
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
