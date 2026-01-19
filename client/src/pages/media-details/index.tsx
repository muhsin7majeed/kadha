import { Box, Container, Skeleton, VStack } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router';

import { MediaType } from '@/types/common';
import type { MovieDetails, TvDetails } from '@/types/media';
import useMediaDetails from './apis/use-media-details';
import { toaster } from '@/components/ui/toaster';
import HeroSection from './components/hero-section';
import OverviewSection from './components/overview-section';
import MovieInfo from './components/movie-info';
import TvInfo from './components/tv-info';
import ProductionInfo from './components/production-info';

const MediaDetails = () => {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>();
  const { data, isLoading } = useMediaDetails(mediaType!, id!);

  const navigate = useNavigate();

  if (!mediaType || !id) {
    toaster.error({
      title: 'Invalid media type or id',
    });

    navigate('/');
    return null;
  }

  if (isLoading || !data) {
    return (
      <Box>
        <Skeleton height="60vh" />
        <Container maxW="6xl" py={8}>
          <VStack gap={6} align="stretch">
            <Skeleton height="200px" borderRadius="lg" />
            <Skeleton height="300px" borderRadius="lg" />
            <Skeleton height="200px" borderRadius="lg" />
          </VStack>
        </Container>
      </Box>
    );
  }

  const isMovie = mediaType === 'movie';

  return (
    <Box minH="100vh">
      {/* Hero Section with Backdrop and Poster */}
      <HeroSection data={data} mediaType={mediaType} />

      {/* Main Content */}
      <Container maxW="6xl" py={8}>
        <VStack gap={10} align="stretch">
          {/* Overview */}
          <OverviewSection overview={data.overview} />

          {/* Media-specific Info */}
          {isMovie ? <MovieInfo data={data as MovieDetails} /> : <TvInfo data={data as TvDetails} />}

          {/* Production Info (shared between movie and TV) */}
          <ProductionInfo data={data} />
        </VStack>
      </Container>
    </Box>
  );
};

export default MediaDetails;
