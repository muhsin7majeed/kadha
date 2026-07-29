import { Badge, Box, Button, Card, Heading, HStack, Image, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import { LuCalendar, LuChevronDown, LuChevronUp, LuFilm, LuPlay, LuTv, LuUser } from 'react-icons/lu';
import type { TvDetailsWithMeta } from '@/features/media/media.types';
import useUpdateSeasonWatch from '@/features/user-media/api/use-update-season-watch';
import TvProgressSummary from '@/features/user-media/components/tv-progress-summary';
import type { TvProgressResponse } from '@/features/user-media/user-media.types';
import InfoCard from './info-card';
import { formatDate } from '@/utils/date';

interface TvInfoProps {
  data: TvDetailsWithMeta;
  progress?: TvProgressResponse;
  isProgressLoading?: boolean;
  isMarkingNextEpisode?: boolean;
  onMarkNextEpisode: () => void;
  onOpenTvProgress: (seasonNumber?: number) => void;
}

const TvInfo = ({
  data,
  progress,
  isProgressLoading,
  isMarkingNextEpisode,
  onMarkNextEpisode,
  onOpenTvProgress,
}: TvInfoProps) => {
  const [showAllSeasons, setShowAllSeasons] = useState(false);
  const updateSeasonWatch = useUpdateSeasonWatch(data.media_id);
  const regularSeasons = data.seasons?.filter((season) => season.season_number > 0) ?? [];
  const specialsCount = data.seasons?.filter((season) => season.season_number === 0).length ?? 0;
  const visibleSeasons = showAllSeasons ? regularSeasons : regularSeasons.slice(0, 10);
  const progressBySeason = new Map((progress?.seasons ?? []).map((season) => [season.seasonNumber, season]));

  return (
    <VStack gap={8} align="stretch">
      <Box>
        <TvProgressSummary
          progress={progress}
          isLoading={isProgressLoading}
          isMarkingNext={isMarkingNextEpisode}
          onMarkNext={onMarkNextEpisode}
          onTrackEpisodes={() => onOpenTvProgress()}
        />
      </Box>

      {/* Quick Stats */}
      <Box>
        <Heading textStyle="sectionTitle" mb={4}>
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
          <Heading textStyle="sectionTitle" mb={4}>
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
                    <Text textStyle="subsectionTitle">{creator.name}</Text>
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
          <Heading textStyle="sectionTitle" mb={4}>
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
                      <Text textStyle="subsectionTitle">{network.name}</Text>
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
          <Heading textStyle="sectionTitle" mb={4}>
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
                      <Text textStyle="supporting" color="fg.muted">
                        S{data.last_episode_to_air.season_number} E{data.last_episode_to_air.episode_number}
                      </Text>
                    </HStack>
                    <Heading textStyle="subsectionTitle">{data.last_episode_to_air.name}</Heading>
                    <HStack gap={2} color="fg.muted" textStyle="supporting">
                      <LuCalendar size={14} />
                      <Text>{formatDate(data.last_episode_to_air.air_date)}</Text>
                    </HStack>
                    {data.last_episode_to_air.overview && (
                      <Text color="fg.muted" textStyle="supporting" lineClamp={3}>
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
                      <Text textStyle="supporting" color="fg.muted">
                        S{data.next_episode_to_air.season_number} E{data.next_episode_to_air.episode_number}
                      </Text>
                    </HStack>
                    <Heading textStyle="subsectionTitle">{data.next_episode_to_air.name}</Heading>
                    <HStack gap={2} color="fg.muted" textStyle="supporting">
                      <LuCalendar size={14} />
                      <Text>{formatDate(data.next_episode_to_air.air_date)}</Text>
                    </HStack>
                    {data.next_episode_to_air.overview && (
                      <Text color="fg.muted" textStyle="supporting" lineClamp={3}>
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
              <Heading textStyle="sectionTitle">Seasons</Heading>
              {specialsCount > 0 && (
                <Text color="fg.muted" textStyle="supporting" mt={1}>
                  Specials are not shown in this overview.
                </Text>
              )}
            </Box>
            {regularSeasons.length > 10 && (
              <Text color="fg.muted" textStyle="supporting">
                Showing {visibleSeasons.length} of {regularSeasons.length}
              </Text>
            )}
          </HStack>
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={4}>
            {visibleSeasons.map((season) => {
              const seasonProgress = progressBySeason.get(season.season_number);
              const isSeasonWatched = Boolean(
                seasonProgress &&
                seasonProgress.airedCount > 0 &&
                seasonProgress.watchedCount >= seasonProgress.airedCount,
              );

              return (
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
                    <VStack align="start" gap={2}>
                      <Text textStyle="compactLabel" lineClamp={1}>
                        {season.name}
                      </Text>
                      <HStack gap={2} textStyle="supporting" color="fg.muted" flexWrap="wrap">
                        <Text>{season.episode_count} episodes</Text>
                        {season.air_date && (
                          <>
                            <Text>•</Text>
                            <Text>{formatDate(season.air_date, 'YYYY')}</Text>
                          </>
                        )}
                      </HStack>
                      {seasonProgress && seasonProgress.airedCount > 0 && (
                        <Text textStyle="supporting" color="fg.muted">
                          {seasonProgress.watchedCount} of {seasonProgress.airedCount} watched
                        </Text>
                      )}
                      {isSeasonWatched ? (
                        <Badge size="sm" colorPalette="green">
                          Watched
                        </Badge>
                      ) : (
                        season.vote_average > 0 && (
                          <Badge size="sm" colorPalette="yellow">
                            ★ {season.vote_average.toFixed(1)}
                          </Badge>
                        )
                      )}
                      <HStack gap="2" flexWrap="wrap" pt="1">
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette="gray"
                          onClick={() => onOpenTvProgress(season.season_number)}
                        >
                          Continue
                        </Button>
                        <Button
                          size="xs"
                          variant="outline"
                          colorPalette={isSeasonWatched ? 'gray' : 'blue'}
                          disabled={!seasonProgress?.airedCount}
                          loading={updateSeasonWatch.isPending}
                          onClick={() =>
                            updateSeasonWatch.mutate({
                              seasonNumber: season.season_number,
                              watched: !isSeasonWatched,
                            })
                          }
                        >
                          {isSeasonWatched ? 'Clear' : 'Mark watched'}
                        </Button>
                      </HStack>
                    </VStack>
                  </Card.Body>
                </Card.Root>
              );
            })}
          </SimpleGrid>
          {regularSeasons.length > 10 && (
            <Button
              variant="outline"
              colorPalette="gray"
              mt={4}
              onClick={() => setShowAllSeasons((current) => !current)}
            >
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
