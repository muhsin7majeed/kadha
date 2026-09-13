import { MediaType, Prisma } from '@prisma/client';

import { parseSnapshotGenreIds } from '@/features/media/media-snapshot.service';
import { createPaginationMeta } from '@/lib/pagination';
import { prisma } from '@/lib/prisma';
import { formatWatchedOnForApi } from './user-media.serializer';
import {
  DiaryAggregateBucket,
  DiaryCoverage,
  DiaryDayBucket,
  DiaryInsightsFilters,
  DiaryInsightsResponse,
  DiarySummary,
  DiaryTimelineQuery,
  DiaryTimelineResponse,
} from './diary.types';

const diaryEventSelect = {
  id: true,
  media_id: true,
  media_type: true,
  seasonNumber: true,
  episodeNumber: true,
  episodeId: true,
  watchedAt: true,
  watchedOn: true,
  rating: true,
  note: true,
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.WatchEventSelect;

const snapshotSelect = {
  media_id: true,
  media_type: true,
  title: true,
  original_title: true,
  overview: true,
  poster_path: true,
  backdrop_path: true,
  vote_average: true,
  vote_count: true,
  popularity: true,
  adult: true,
  genre_ids: true,
  release_date: true,
  original_language: true,
  runtime: true,
  status: true,
} as const satisfies Prisma.MediaSnapshotSelect;

type DiaryEventRow = Prisma.WatchEventGetPayload<{
  select: typeof diaryEventSelect;
}>;
type SnapshotRow = Prisma.MediaSnapshotGetPayload<{
  select: typeof snapshotSelect;
}>;

const validDiaryEventWhere: Prisma.WatchEventWhereInput = {
  OR: [
    {
      media_type: MediaType.movie,
      seasonNumber: null,
      episodeNumber: null,
      episodeId: null,
    },
    {
      media_type: MediaType.tv,
      seasonNumber: { not: null },
      episodeNumber: { not: null },
    },
  ],
};

const mediaKey = (mediaType: MediaType, mediaId: number) => `${mediaType}:${mediaId}`;

const utcDate = (year: number, month: number, day: number) => {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(year, month - 1, day);
  return date;
};

const getDateRange = (query: DiaryTimelineQuery) => {
  if (query.date) {
    const [year, month, day] = query.date.split('-').map(Number);
    const start = utcDate(year, month, day);
    const end = utcDate(year, month, day + 1);
    return { gte: start, lt: end };
  }

  if (query.year !== undefined) {
    const startMonth = query.month ?? 1;
    const start = utcDate(query.year, startMonth, 1);
    const end = query.month === undefined ? utcDate(query.year + 1, 1, 1) : utcDate(query.year, startMonth + 1, 1);
    return { gte: start, lt: end };
  }

  return undefined;
};

const getDiaryWhere = (userId: string, query?: DiaryTimelineQuery): Prisma.WatchEventWhereInput => {
  const dateRange = query ? getDateRange(query) : undefined;

  return {
    userId,
    ...validDiaryEventWhere,
    ...(query?.mediaType && query.mediaType !== 'all' ? { media_type: query.mediaType as MediaType } : {}),
    ...(dateRange ? { watchedOn: dateRange } : {}),
  };
};

const sortEvents = (left: DiaryEventRow, right: DiaryEventRow) => {
  if (left.watchedOn === null && right.watchedOn !== null) return 1;
  if (left.watchedOn !== null && right.watchedOn === null) return -1;

  const watchedOnDifference = (right.watchedOn?.getTime() ?? 0) - (left.watchedOn?.getTime() ?? 0);
  if (watchedOnDifference !== 0) return watchedOnDifference;

  const watchedAtDifference = right.watchedAt.getTime() - left.watchedAt.getTime();
  if (watchedAtDifference !== 0) return watchedAtDifference;

  const createdAtDifference = right.createdAt.getTime() - left.createdAt.getTime();
  if (createdAtDifference !== 0) return createdAtDifference;

  return right.id.localeCompare(left.id);
};

const getMediaWhere = (events: DiaryEventRow[]) => {
  const movieIds = [
    ...new Set(events.filter((event) => event.media_type === MediaType.movie).map((event) => event.media_id)),
  ];
  const tvIds = [
    ...new Set(events.filter((event) => event.media_type === MediaType.tv).map((event) => event.media_id)),
  ];

  return {
    OR: [
      ...(movieIds.length > 0 ? [{ media_type: MediaType.movie, media_id: { in: movieIds } }] : []),
      ...(tvIds.length > 0 ? [{ media_type: MediaType.tv, media_id: { in: tvIds } }] : []),
    ],
  };
};

const getCoverage = (coveredEntries: number, totalEntries: number): DiaryCoverage => ({
  coveredEntries,
  totalEntries,
  ratio: totalEntries > 0 ? coveredEntries / totalEntries : 0,
});

const getRuntime = (event: DiaryEventRow, snapshotsByMedia: Map<string, SnapshotRow>) => {
  const runtime = snapshotsByMedia.get(mediaKey(event.media_type, event.media_id))?.runtime;
  return runtime !== null && runtime !== undefined && runtime > 0 ? runtime : null;
};

const buildSummary = (events: DiaryEventRow[], snapshotsByMedia: Map<string, SnapshotRow>): DiarySummary => {
  const runtimeCoveredEvents = events.filter((event) => getRuntime(event, snapshotsByMedia) !== null);
  const datedEventCount = events.filter((event) => event.watchedOn !== null).length;

  return {
    totalEntries: events.length,
    movieWatches: events.filter((event) => event.media_type === MediaType.movie).length,
    episodeWatches: events.filter((event) => event.media_type === MediaType.tv).length,
    uniqueTitles: new Set(events.map((event) => mediaKey(event.media_type, event.media_id))).size,
    estimatedMinutes: runtimeCoveredEvents.reduce(
      (total, event) => total + (getRuntime(event, snapshotsByMedia) ?? 0),
      0,
    ),
    runtimeCoverage: getCoverage(runtimeCoveredEvents.length, events.length),
    dateCoverage: getCoverage(datedEventCount, events.length),
  };
};

const createEmptyAggregate = (): DiaryAggregateBucket => ({
  movieWatches: 0,
  episodeWatches: 0,
  totalEntries: 0,
  estimatedMinutes: 0,
  runtimeCoverage: getCoverage(0, 0),
});

const addEventToAggregate = (
  bucket: DiaryAggregateBucket,
  event: DiaryEventRow,
  snapshotsByMedia: Map<string, SnapshotRow>,
) => {
  bucket.totalEntries += 1;
  if (event.media_type === MediaType.movie) bucket.movieWatches += 1;
  else bucket.episodeWatches += 1;

  const runtime = getRuntime(event, snapshotsByMedia);
  if (runtime !== null) {
    bucket.estimatedMinutes += runtime;
    bucket.runtimeCoverage.coveredEntries += 1;
  }
  bucket.runtimeCoverage.totalEntries += 1;
  bucket.runtimeCoverage.ratio = bucket.runtimeCoverage.coveredEntries / bucket.runtimeCoverage.totalEntries;
};

const getFallbackTitle = (event: DiaryEventRow) =>
  event.media_type === MediaType.movie ? `Movie ${event.media_id}` : `TV show ${event.media_id}`;

const serializeEntry = (
  event: DiaryEventRow,
  snapshot: SnapshotRow | undefined,
  movieRating: number | null | undefined,
) => ({
  id: event.id,
  media_id: event.media_id,
  media_type: event.media_type,
  seasonNumber: event.seasonNumber,
  episodeNumber: event.episodeNumber,
  episodeId: event.episodeId,
  watchedAt: event.watchedAt.toISOString(),
  watchedOn: formatWatchedOnForApi(event.watchedOn),
  rating: event.media_type === MediaType.movie ? (movieRating ?? null) : event.rating,
  note: event.note,
  createdAt: event.createdAt.toISOString(),
  updatedAt: event.updatedAt.toISOString(),
  title: snapshot?.title ?? getFallbackTitle(event),
  original_title: snapshot?.original_title ?? null,
  overview: snapshot?.overview ?? null,
  poster_path: snapshot?.poster_path ?? null,
  backdrop_path: snapshot?.backdrop_path ?? null,
  vote_average: snapshot?.vote_average ?? null,
  vote_count: snapshot?.vote_count ?? null,
  popularity: snapshot?.popularity ?? null,
  adult: snapshot?.adult ?? null,
  genre_ids: parseSnapshotGenreIds(snapshot?.genre_ids),
  release_date: snapshot?.release_date ?? null,
  original_language: snapshot?.original_language ?? null,
  runtime: snapshot?.runtime ?? null,
  status: snapshot?.status ?? null,
});

export async function getDiaryTimeline(userId: string, query: DiaryTimelineQuery): Promise<DiaryTimelineResponse> {
  const [events, recordedDates] = await Promise.all([
    prisma.watchEvent.findMany({
      where: getDiaryWhere(userId, query),
      select: diaryEventSelect,
    }),
    prisma.watchEvent.findMany({
      where: {
        ...getDiaryWhere(userId),
        watchedOn: { not: null },
      },
      select: { watchedOn: true },
    }),
  ]);

  events.sort(sortEvents);

  const mediaWhere = getMediaWhere(events);
  const [snapshots, userMediaRows] =
    events.length === 0
      ? [[], []]
      : await Promise.all([
          prisma.mediaSnapshot.findMany({
            where: mediaWhere,
            select: snapshotSelect,
          }),
          prisma.userMedia.findMany({
            where: { userId, ...mediaWhere },
            select: { media_id: true, media_type: true, rating: true },
          }),
        ]);

  const snapshotsByMedia = new Map(
    snapshots.map((snapshot) => [mediaKey(snapshot.media_type, snapshot.media_id), snapshot]),
  );
  const ratingsByMedia = new Map(userMediaRows.map((row) => [mediaKey(row.media_type, row.media_id), row.rating]));
  const availableYears = [
    ...new Set(recordedDates.flatMap((event) => (event.watchedOn ? [event.watchedOn.getUTCFullYear()] : []))),
  ].sort((left, right) => right - left);
  const pageEvents = events.slice((query.page - 1) * query.limit, query.page * query.limit);

  return {
    data: pageEvents.map((event) =>
      serializeEntry(
        event,
        snapshotsByMedia.get(mediaKey(event.media_type, event.media_id)),
        ratingsByMedia.get(mediaKey(event.media_type, event.media_id)),
      ),
    ),
    summary: buildSummary(events, snapshotsByMedia),
    availableYears,
    pagination: createPaginationMeta(query.page, query.limit, events.length),
  };
}

export async function getDiaryInsights(
  userId: string,
  filters: DiaryInsightsFilters,
): Promise<DiaryInsightsResponse> {
  const mediaTypeWhere =
    filters.mediaType === 'all' ? {} : { media_type: filters.mediaType as MediaType };
  const yearRange = {
    gte: utcDate(filters.year, 1, 1),
    lt: utcDate(filters.year + 1, 1, 1),
  };
  const baseWhere: Prisma.WatchEventWhereInput = {
    userId,
    ...validDiaryEventWhere,
    ...mediaTypeWhere,
  };

  const [events, allDateRows] = await Promise.all([
    prisma.watchEvent.findMany({
      where: { ...baseWhere, watchedOn: yearRange },
      select: diaryEventSelect,
    }),
    prisma.watchEvent.findMany({
      where: baseWhere,
      select: { watchedOn: true },
    }),
  ]);

  const snapshots =
    events.length === 0
      ? []
      : await prisma.mediaSnapshot.findMany({
          where: getMediaWhere(events),
          select: snapshotSelect,
        });
  const snapshotsByMedia = new Map(
    snapshots.map((snapshot) => [mediaKey(snapshot.media_type, snapshot.media_id), snapshot]),
  );
  const monthly = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    ...createEmptyAggregate(),
  }));
  const dailyByDate = new Map<string, DiaryDayBucket>();

  for (const event of events) {
    const date = formatWatchedOnForApi(event.watchedOn);
    if (!date) continue;

    addEventToAggregate(monthly[event.watchedOn!.getUTCMonth()], event, snapshotsByMedia);
    const day = dailyByDate.get(date) ?? { date, ...createEmptyAggregate() };
    addEventToAggregate(day, event, snapshotsByMedia);
    dailyByDate.set(date, day);
  }

  const daily = [...dailyByDate.values()].sort((left, right) => left.date.localeCompare(right.date));
  const busiestDay = daily.reduce<DiaryInsightsResponse['busiestDay']>((busiest, day) => {
    if (!busiest || day.totalEntries > busiest.totalEntries) {
      return { date: day.date, totalEntries: day.totalEntries };
    }
    return busiest;
  }, null);
  const datedRows = allDateRows.filter(
    (row): row is { watchedOn: Date } => row.watchedOn !== null,
  );
  const availableYears = [
    ...new Set(datedRows.map((row) => row.watchedOn.getUTCFullYear())),
  ].sort((left, right) => right - left);

  return {
    year: filters.year,
    summary: buildSummary(events, snapshotsByMedia),
    monthly,
    daily,
    activeDays: daily.length,
    busiestDay,
    dateCoverage: getCoverage(datedRows.length, allDateRows.length),
    availableYears,
  };
}
