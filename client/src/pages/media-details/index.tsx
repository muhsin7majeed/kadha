import { Box, Button, Container, Heading, HStack, Skeleton, Stack, Text, VStack } from '@chakra-ui/react';
import { useEffect } from 'react';
import { LuArrowLeft, LuRefreshCw } from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';

import { MediaType } from '@/types/common';
import useMediaDetails from '@/features/media/api/use-media-details';
import { toaster } from '@/components/ui/toaster-store';
import HeroSection from './components/hero-section';
import OverviewSection from './components/overview-section';
import MovieInfo from './components/movie-info';
import TvInfo from './components/tv-info';
import ProductionInfo from './components/production-info';
import WatchProvidersSection from './components/watch-providers-section';

const MediaDetails = () => {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>();
  const navigate = useNavigate();
  const isValidMediaType = mediaType === 'movie' || mediaType === 'tv';
  const hasValidParams = isValidMediaType && Boolean(id);
  const { data, isError, isLoading, isFetching, refetch } = useMediaDetails(isValidMediaType ? mediaType : undefined, id);

  useEffect(() => {
    if (hasValidParams) return;

    toaster.error({
      title: 'Invalid media type or id',
    });
    navigate('/');
  }, [hasValidParams, navigate]);

  if (!hasValidParams) {
    return null;
  }

  if (isLoading) {
    return (
      <Box>
        <Box px={{ base: 4, md: 8 }} pt={{ base: 20, md: 28 }} pb={8}>
          <Container maxW="6xl" px={0}>
            <Stack direction={{ base: 'column', md: 'row' }} gap={{ base: 6, md: 10 }} align={{ md: 'end' }}>
              <Skeleton width={{ base: '200px', md: '280px' }} height={{ base: '300px', md: '420px' }} borderRadius="xl" />
              <VStack align={{ base: 'center', md: 'start' }} gap={4} flex={1}>
                <Skeleton height="7" width="40" />
                <Skeleton height="12" width={{ base: 'full', md: '70%' }} />
                <Skeleton height="6" width={{ base: '85%', md: '56' }} />
                <Skeleton height="10" width={{ base: 'full', md: '96' }} />
              </VStack>
            </Stack>
          </Container>
        </Box>
        <Container maxW="6xl" py={8}>
          <VStack gap={6} align="stretch">
            <Skeleton height="120px" borderRadius="lg" />
            <Skeleton height="180px" borderRadius="lg" />
            <Skeleton height="220px" borderRadius="lg" />
          </VStack>
        </Container>
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Container maxW="3xl" py={{ base: 12, md: 20 }}>
        <VStack align="start" gap={5}>
          <Heading size="xl">Could not load this title</Heading>
          <Text color="fg.muted">
            The media details are unavailable right now. The title may have moved, or the service may be temporarily
            unreachable.
          </Text>
          <HStack gap={3} flexWrap="wrap">
            <Button variant="outline" colorPalette="gray" onClick={() => navigate(-1)}>
              <LuArrowLeft />
              Back
            </Button>
            <Button colorPalette="brand" onClick={() => refetch()} loading={isFetching}>
              <LuRefreshCw />
              Retry
            </Button>
          </HStack>
        </VStack>
      </Container>
    );
  }

  const validMediaType = mediaType as MediaType;
  const validId = id as string;
  const title = data.media_type === 'movie' ? data.title : data.name;

  return (
    <Box minH="100vh" bg="bg">
      {/* Hero Section with Backdrop and Poster */}
      <HeroSection data={data} />

      {/* Main Content */}
      <Container maxW="6xl" py={8}>
        <VStack gap={10} align="stretch">
          {/* Overview */}
          <OverviewSection overview={data.overview} />

          <WatchProvidersSection mediaType={validMediaType} id={validId} title={title} />

          {/* Media-specific Info */}
          {data.media_type === 'movie' ? <MovieInfo data={data} /> : <TvInfo data={data} />}

          {/* Production Info (shared between movie and TV) */}
          <ProductionInfo data={data} />
        </VStack>
      </Container>
    </Box>
  );
};

export default MediaDetails;
