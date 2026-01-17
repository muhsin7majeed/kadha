import { useRef } from 'react';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { Box, Flex, IconButton } from '@chakra-ui/react';

import MediaCard from '../media-card';
import MediaCarousalSkeleton from './media-carousal-skeleton';
import { MovieWithMeta, TvWithMeta } from '@/types/media';
import PageHeader from '../page-header';

interface MediaCarousalProps {
  mediaType: 'movie' | 'tv';
  title: string;
  data: MovieWithMeta[] | TvWithMeta[];
  isLoading?: boolean;
  isFetching?: boolean;
}

const SCROLL_AMOUNT = 400;

const ScrollButton = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => {
  return (
    <IconButton
      aria-label={`Scroll ${direction}`}
      onClick={onClick}
      bg="blackAlpha.600"
      color="white"
      _hover={{ bg: 'blackAlpha.800' }}
    >
      {direction === 'left' ? <FaAngleLeft /> : <FaAngleRight />}
    </IconButton>
  );
};

const MediaCarousal = ({ title, data, isLoading, isFetching }: MediaCarousalProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;

    if (container) {
      const scrollAmount = direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT;
      const maxScroll = container.scrollWidth - container.clientWidth;

      // Only loop if we're already at the edges
      if (direction === 'left' && container.scrollLeft === 0) {
        // At far left, loop to end
        container.scrollTo({ left: maxScroll, behavior: 'auto' });
      } else if (direction === 'right' && container.scrollLeft >= maxScroll) {
        // At far right, loop to start
        container.scrollTo({ left: 0, behavior: 'auto' });
      } else {
        // Normal scroll
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  if (isLoading) {
    return <MediaCarousalSkeleton />;
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <PageHeader isFetching={isFetching}>{title}</PageHeader>

        <Flex gap={1} alignItems="center">
          <ScrollButton direction="left" onClick={() => scroll('left')} />
          <ScrollButton direction="right" onClick={() => scroll('right')} />
        </Flex>
      </Flex>

      <Box ref={scrollContainerRef} overflowX="auto" scrollBehavior="smooth">
        <Flex gap={4}>
          {data.map((media) => (
            <MediaCard key={media.id} media={media} isLink />
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default MediaCarousal;
