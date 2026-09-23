import { useRef } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { Box, Button, Flex, IconButton } from '@chakra-ui/react';
import { Link } from 'react-router';

import MediaCard from '../media-card';
import MediaCarouselSkeleton from './media-carousel-skeleton';
import type { MediaCardModel } from '@/features/media/media-card-model';
import PageHeader from '../page-header';

interface MediaCarouselProps {
  title: string;
  data: MediaCardModel[];
  isLoading?: boolean;
  isFetching?: boolean;
  viewAllTo?: string;
}

const SCROLL_AMOUNT = 400;

const ScrollButton = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => (
  <IconButton
    aria-label={`Scroll ${direction}`}
    onClick={onClick}
    colorPalette="brand"
    variant="subtle"
    borderRadius="full"
  >
    {direction === 'left' ? <LuChevronLeft /> : <LuChevronRight />}
  </IconButton>
);

const MediaCarousel = ({ title, data, isLoading, isFetching, viewAllTo }: MediaCarouselProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
    const maxScroll = container.scrollWidth - container.clientWidth;

    if (direction === 'left' && container.scrollLeft === 0) {
      container.scrollTo({ left: maxScroll, behavior: 'auto' });
    } else if (direction === 'right' && container.scrollLeft >= maxScroll) {
      container.scrollTo({ left: 0, behavior: 'auto' });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) return <MediaCarouselSkeleton label={`Loading ${title}`} />;

  return (
    <Box mb="4">
      <Flex justifyContent="space-between" alignItems="center" gap="3" mb="4">
        <PageHeader isRefreshing={isFetching} mb="0">
          {title}
        </PageHeader>

        <Flex gap="1" alignItems="center">
          {viewAllTo ? (
            <Button asChild size="sm" variant="ghost" colorPalette="brand">
              <Link to={viewAllTo}>View all</Link>
            </Button>
          ) : null}
          <ScrollButton direction="left" onClick={() => scroll('left')} />
          <ScrollButton direction="right" onClick={() => scroll('right')} />
        </Flex>
      </Flex>

      <Box ref={scrollContainerRef} overflowX="auto" scrollBehavior="smooth">
        <Flex gap="4">
          {data.map((media) => (
            <MediaCard key={`${media.media_type}:${media.media_id}`} media={media} />
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default MediaCarousel;
