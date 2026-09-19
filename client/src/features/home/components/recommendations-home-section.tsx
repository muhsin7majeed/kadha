import MediaCarousel from '@/components/media-carousel';
import useRecommendations from '@/features/recommendations/api/use-recommendations';
import HomeSectionError from './home-section-error';

const RecommendationsHomeSection = () => {
  const query = useRecommendations(1, 10, { enabled: true });
  const response = query.data?.data;

  if (query.error) {
    return (
      <HomeSectionError
        title="For You"
        description="Your recommendations could not be loaded."
        onRetry={() => void query.refetch()}
      />
    );
  }

  if (!query.isLoading && (!response || response.status !== 'READY' || response.items.length === 0)) return null;

  return (
    <MediaCarousel
      title="For You"
      data={response?.items.map((item) => item.media) ?? []}
      isLoading={query.isLoading}
      isFetching={query.isFetching}
      viewAllTo="/app/recommendations"
    />
  );
};

export default RecommendationsHomeSection;
