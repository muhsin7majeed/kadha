import { Box, Flex, Image, Skeleton, Text } from '@chakra-ui/react';
import { useNavigate, useParams } from 'react-router';

import { MediaType } from '@/types/media';
import useMediaDetails from './apis/useMediaDetails';
import { toaster } from '@/components/ui/toaster';
import { formatDate, minutesToHours } from '@/lib/dateFns';

const MediaDetails = () => {
  const { mediaType, id } = useParams<{ mediaType: MediaType; id: string }>();
  const navigate = useNavigate();

  if (!mediaType || !id) {
    toaster.error({
      title: 'Invalid media type or id',
    });

    navigate('/');
    return;
  }

  const { data, isLoading, error } = useMediaDetails(mediaType, id);
  console.log(data);

  if (isLoading || !data) {
    return <Skeleton height="100vh" />;
  }

  return (
    <Box position="relative">
      <Box position="absolute" top={0} left={0} width="100%" height="50vh" minHeight="300px">
        <Box
          position="relative"
          width="100%"
          height="100%"
          _after={{
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to bottom, transparent 0%, #09090B 100%)',
            zIndex: 1,
          }}
        >
          <Image
            src={`https://image.tmdb.org/t/p/w500${data.backdrop_path}`}
            alt={data?.title}
            width="100%"
            height="100%"
            objectFit="cover"
            filter="brightness(0.5)"
          />
        </Box>
      </Box>

      <Flex gap={4} flexDirection={'column'} alignItems={'center'}>
        <Image
          zIndex={2}
          marginTop={'150px'}
          width="200px"
          height="300px"
          aspectRatio={9 / 16}
          borderRadius="md"
          src={`https://image.tmdb.org/t/p/w500${data.poster_path}`}
          alt={data.title}
          objectFit="cover"
        />

        <Box textAlign={'center'}>
          <Text fontSize="3xl" fontWeight="bold">
            {data.title} ({formatDate(data.release_date, 'YYYY')})
          </Text>

          <Text fontSize="lg" color="gray.500">
            {data.adult ? 'Adult' : 'PG-13'} - {minutesToHours(data.runtime)} -{' '}
            {data.genres.map((genre) => genre.name).join(', ')}
          </Text>
        </Box>
      </Flex>

      <Box mt={'4'}>
        <Text fontSize="lg" fontStyle={'italic'} mb={2} fontWeight="bold">
          {data.tagline}
        </Text>

        <Text fontSize="lg" color="gray.500">
          {data.overview}
        </Text>
      </Box>

      <Box mt={4}></Box>
    </Box>
  );
};

export default MediaDetails;
