import {
  LuBookOpen,
  LuChartBar,
  LuClapperboard,
  LuListChecks,
  LuLock,
  LuSparkles,
} from 'react-icons/lu';

const CURRENT_FEATURES = [
  {
    icon: LuBookOpen,
    title: 'Your library and viewing diary',
    description:
      'Track watched, liked, and watchlisted titles. Record dates, ratings, private notes, rewatches, and individual TV episodes, then revisit them in your diary.',
  },
  {
    icon: LuListChecks,
    title: 'Shared collections',
    description:
      'Make lists for movie nights, recommendations, or anything else. Invite friends as viewers or editors, or share a read-only public link.',
  },
  {
    icon: LuClapperboard,
    title: 'TV progress',
    description:
      'Keep up with seasons and episodes, see what is in progress, and find the next episode without treating an entire series as one watch.',
  },
  {
    icon: LuSparkles,
    title: 'Personal recommendations',
    description:
      'Get suggestions based on your own library and feedback. Your private activity is not combined with another user’s recommendation profile.',
  },
  {
    icon: LuChartBar,
    title: 'Insights that explain themselves',
    description:
      'Explore viewing patterns, favorite genres and people, ratings, and estimated watch time, with coverage shown when metadata is incomplete.',
  },
  {
    icon: LuLock,
    title: 'Privacy and data ownership',
    description:
      'New accounts start private. Control each part of your profile, export or import Kadha data, permanently delete your account, or self-host the app.',
  },
];

export default CURRENT_FEATURES;
