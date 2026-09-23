import { Button, HStack, Stack, Text } from '@chakra-ui/react';
import { lazy, Suspense } from 'react';
import { Link } from 'react-router';

import PageHeader from '@/components/page-header';
import useHomePreferences from '@/features/home/api/use-home-preferences';
import HomeSectionError from '@/features/home/components/home-section-error';
import { HOME_SECTION_REGISTRY } from '@/features/home/home-registry';
import ListSkeleton from '@/components/loading/list-skeleton';

const mediaCardLabModulePath = '/src/features/media-card-lab/media-card-lab-dialog.tsx';
const MediaCardLabDialog = import.meta.env.DEV
  ? lazy(() => import(/* @vite-ignore */ mediaCardLabModulePath))
  : null;

const Home = () => {
  const preferences = useHomePreferences();

  if (preferences.isLoading) {
    return (
      <Stack gap="6">
        <PageHeader subHeader="Pick up where you left off or find the next thing worth watching.">
          Home
        </PageHeader>
        <ListSkeleton label="Loading your Home" rows={4} />
      </Stack>
    );
  }

  if (preferences.error || !preferences.data) {
    return (
      <HomeSectionError
        title="Home is unavailable"
        description="Your Home layout could not be loaded."
        onRetry={() => void preferences.refetch()}
      />
    );
  }

  const visibleItems = preferences.data.items.filter((item) => item.visible);

  return (
    <Stack gap="6">
      <PageHeader
        isRefreshing={preferences.isFetching && preferences.data !== undefined}
        subHeader="Pick up where you left off or find the next thing worth watching."
        action={
          <HStack gap="2" flexWrap="wrap" justify="end">
            {MediaCardLabDialog && (
              <Suspense fallback={null}>
                <MediaCardLabDialog />
              </Suspense>
            )}
            <Button asChild size="sm" variant="outline" colorPalette="gray">
              <Link to="/app/settings/home">Customize</Link>
            </Button>
          </HStack>
        }
      >
        Home
      </PageHeader>

      {visibleItems.length === 0 ? (
        <Stack align="flex-start" gap="2">
          <Text color="fg.muted" textStyle="body">
            No sections are visible on Home.
          </Text>
          <Button asChild size="sm" colorPalette="brand" variant="outline">
            <Link to="/app/settings/home">Choose Home sections</Link>
          </Button>
        </Stack>
      ) : (
        <Stack data-testid="home-sections" gap="6">
          {visibleItems.map((item) => {
            const Section = HOME_SECTION_REGISTRY[item.id];
            return (
              <section key={item.id}>
                <Section />
              </section>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
};

export default Home;
