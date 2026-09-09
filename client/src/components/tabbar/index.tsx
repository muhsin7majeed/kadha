import useNavigationPreferences from '@/features/navigation/api/use-navigation-preferences';
import { DEFAULT_NAVIGATION_PREFERENCES } from '@/features/navigation/navigation-defaults';
import { NavigationSurface } from '@/features/navigation/components/navigation-surface';

const TabBar = () => {
  const { data } = useNavigationPreferences();
  return <NavigationSurface preferences={data ?? DEFAULT_NAVIGATION_PREFERENCES} />;
};

export default TabBar;
