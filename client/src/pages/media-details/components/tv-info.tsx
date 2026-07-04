import { Badge, Box, Button, Card, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCalendar, LuChevronDown, LuChevronUp, LuFilm, LuPlay, LuTv, LuUser } from 'react-icons/lu';
import type { TvDetailsWithMeta } from '@/features/media/media.types';
import InfoCard from './info-card';
import { formatDate } from '@/utils/date';

interface TvInfoProps {
  data: TvDetailsWithMeta;
}

const TvInfo = ({ data }: TvInfoProps) => {
  const [showAllSeasons, setShowAllSeasons] = useState(false);
  const regularSeasons = data.seasons?.filter((season) => season.season_number > 0) ?? [];
  const specialsCount = data.seasons?.filter((season) => season.season_number === 0).length ?? 0;
  const visibleSeasons = showAllSeasons ? regularSeasons : regularSeasons.slice(0, 10);

  return (
    <VStack gap={8} align="stretch">
      {/* Quick Stats */}
      <Box>
        <Heading size="lg" mb={4}>
          Series Info
        </Heading>
        <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} gap={4}>
          <InfoCard label="Seasons" value={data.number_of_seasons} icon={<LuTv size={16} />} />
          <InfoCard label="Episodes" value={data.number_of_episodes} icon={<LuFilm size={16} />} />
          <InfoCard label="Type" value={data.type || 'Scripted'} />
          <InfoCard
            label="Status"
            value={
              <Badge colorPalette={data.in_production ? 'green' : 'gray'} size="sm">
                {data.in_production ? 'In Production' : data.status}
              </Badge>
            }
          />
        </SimpleGrid>
      </Box>

      {/* Created By */}
      {data.created_by && data.created_by.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            Created By
          </Heading>
          <HStack gap={4} flexWrap="wrap">
            {data.created_by.map((creator) => (
              <Card.Root key={creator.id} variant="outline" size="sm">
                <Card.Body>
                  <HStack gap={3}>
                    {creator.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${creator.profile_path}`}
                        alt={creator.name}
                        width="50px"
                        height="50px"
                        objectFit="cover"
                        borderRadius="full"
                      />
                    ) : (
                      <Box
                        width="50px"
                        height="50px"
                        bg="bg.subtle"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <LuUser size={24} />
                      </Box>
                    )}
                    <Text fontWeight="semibold">{creator.name}</Text>
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </HStack>
        </Box>
      )}

      {/* Networks */}
      {data.networks && data.networks.length > 0 && (
        <Box>
          <Heading size="lg" mb={4}>
            Networks
          </Heading>
          <HStack gap={4} flexWrap="wrap">
            {data.networks.map((network) => (
              <Card.Root key={network.id} variant="outline" size="sm">
                <Card.Body>
                  <HStack gap={3}>
                    {network.logo_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w200${network.logo_path}`}
                        alt={`${network.name} logo`}
                        height="30px"
                        objectFit="contain"
                      />
                    ) : (
                      <Text fontWeight="semibold">{network.name}</Text>
                    )}
                  </HStack>
                </Card.Body>
              </Card.Root>
            ))}
          </HStack>
        </Box>
      )}

      {/* Episode Info */}
      {(data.last_episode_to_air || data.next_episode_to_air) && (
        <Box>
          <Heading size="lg" mb={4}>
            Episodes
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
            {/* Last Episode */}
            {data.last_episode_to_air && (
              <Card.Root variant="outline">
                <Card.Body>
                  <VStack align="start" gap={3}>
                    <HStack justify="space-between" width="100%" gap={3} align="start" flexWrap="wrap">
                      <Badge colorPalette="blue">Last Episode</Badge>
                      <Text fontSize="sm" color="fg.muted">
                        S{data.last_episode_to_air.season_number} E{data.last_episode_to_air.episode_number}
                      </Text>
                    </HStack>
                    <Heading size="md">{data.last_episode_to_air.name}</Heading>
                    <HStack gap={2} color="fg.muted" fontSize="sm">
                      <LuCalendar size={14} />
                      <Text>{formatDate(data.last_episode_to_air.air_date)}</Text>
                    </HStack>
                    {data.last_episode_to_air.overview && (
                      <Text color="fg.muted" fontSize="sm" lineClamp={3}>
                        {data.last_episode_to_air.overview}
                      </Text>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}

            {/* Next Episode */}
            {data.next_episode_to_air && (
              <Card.Root variant="outline" borderColor="brand.muted">
                <Card.Body>
                  <VStack align="start" gap={3}>
                    <HStack justify="space-between" width="100%" gap={3} align="start" flexWrap="wrap">
                      <Badge colorPalette="brand">Next Episode</Badge>
                      <Text fontSize="sm" color="fg.muted">
                        S{data.next_episode_to_air.season_number} E{data.next_episode_to_air.episode_number}
                      </Text>
                    </HStack>
                    <Heading size="md">{data.next_episode_to_air.name}</Heading>
                    <HStack gap={2} color="fg.muted" fontSize="sm">
                      <LuCalendar size={14} />
                      <Text>{formatDate(data.next_episode_to_air.air_date)}</Text>
                    </HStack>
                    {data.next_episode_to_air.overview && (
                      <Text color="fg.muted" fontSize="sm" lineClamp={3}>
                        {data.next_episode_to_air.overview}
                      </Text>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            )}
          </SimpleGrid>
        </Box>
      )}

      {/* Seasons */}
      {regularSeasons.length > 0 && (
        <Box>
          <HStack justify="space-between" align="end" mb={4} gap={4} flexWrap="wrap">
            <Box>
              <Heading size="lg">Seasons</Heading>
              {specialsCount > 0 && (
                <Text color="fg.muted" fontSize="sm" mt={1}>
                  Specials are not shown in this overview.
                </Text>
              )}
            </Box>
            {regularSeasons.length > 10 && (
              <Text color="fg.muted" fontSize="sm">
                Showing {visibleSeasons.length} of {regularSeasons.length}
              </Text>
            )}
          </HStack>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={4}>
            {visibleSeasons.map((season) => (
              <Card.Root key={season.id} variant="outline" overflow="hidden">
                {season.poster_path ? (
                  <Image
                    src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                    alt={season.name}
                    width="100%"
                    height="200px"
                    objectFit="cover"
                  />
                ) : (
                  <Box
                    width="100%"
                    height="200px"
                    bg="bg.subtle"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <LuPlay size={40} />
                  </Box>
                )}
                <Card.Body p={3}>
                  <VStack align="start" gap={1}>
                    <Text fontWeight="semibold" fontSize="sm" lineClamp={1}>
                      {season.name}
                    </Text>
                    <HStack gap={2} fontSize="xs" color="fg.muted" flexWrap="wrap">
                      <Text>{season.episode_count} episodes</Text>
                      {season.air_date && (
                        <>
                          <Text>•</Text>
                          <Text>{formatDate(season.air_date, 'YYYY')}</Text>
                        </>
                      )}
                    </HStack>
                    {season.vote_average > 0 && (
                      <Badge size="sm" colorPalette="yellow">
                        ★ {season.vote_average.toFixed(1)}
                      </Badge>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            ))}
          </SimpleGrid>
          {regularSeasons.length > 10 && (
            <Button variant="outline" colorPalette="gray" mt={4} onClick={() => setShowAllSeasons((current) => !current)}>
              {showAllSeasons ? <LuChevronUp /> : <LuChevronDown />}
              {showAllSeasons ? 'Show fewer seasons' : `Show all ${regularSeasons.length} seasons`}
            </Button>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default TvInfo;
