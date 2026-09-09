import useNavigationPreferences from '@/features/navigation/api/use-navigation-preferences';
import { DEFAULT_NAVIGATION_PREFERENCES } from '@/features/navigation/navigation-defaults';
import { NavigationSurface } from '@/features/navigation/components/navigation-surface';

const TabBar = () => {
  const { data, isError } = useNavigationPreferences();
  if (!data && !isError) return null;
  return <NavigationSurface preferences={data ?? DEFAULT_NAVIGATION_PREFERENCES} />;
};

export default TabBar;
