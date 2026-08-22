export type InsightMediaType = 'all' | 'movie' | 'tv';
export type InsightCoverageStatus = 'COMPLETE' | 'PARTIAL' | 'UNAVAILABLE';

export interface InsightRankingItem {
  id: string;
  label: string;
  rank: number;
  value: number;
  unit: 'rating' | 'titles';
  denominator: number;
  share: number;
  sampleSize: number;
  imagePath?: string | null;
}

export interface InsightDistributionItem {
  key: string;
  label: string;
  value: number;
  unit: 'titles';
  share: number;
}

interface InsightCoverage {
  coveredTitleCount: number;
  ratio: number;
  status: InsightCoverageStatus;
}

export interface ViewingInsights {
  schemaVersion: 1;
  scope: {
    period: 'all';
    mediaType: InsightMediaType;
    basis: 'CURRENT_TRACKED_STATE';
  };
  summary: {
    watchedTitleCount: number;
    movieCount: number;
    tvSeriesCount: number;
    watchedEpisodeCount: number;
    personalRating: {
      average: number | null;
      sampleSize: number;
    };
  };
  viewingSignature: {
    status: 'AVAILABLE' | 'INSUFFICIENT_DATA';
    topGenre: InsightRankingItem | null;
    topMovieDirector: InsightRankingItem | null;
    topTvCreator: InsightRankingItem | null;
    topCastMember: InsightRankingItem | null;
  };
  rankings: {
    genres: InsightRankingItem[];
    cast: InsightRankingItem[];
    movieDirectors: InsightRankingItem[];
    tvCreators: InsightRankingItem[];
    likedGenres: InsightRankingItem[];
    highestRatedGenres: InsightRankingItem[];
  };
  distributions: {
    mediaTypes: InsightDistributionItem[];
    releaseDecades: InsightDistributionItem[];
    originalLanguages: InsightDistributionItem[];
  };
  coverage: {
    eligibleTitleCount: number;
    genres: InsightCoverage;
    credits: InsightCoverage;
    runtime: InsightCoverage;
  };
  methodology: {
    genreSharesOverlap: true;
    castBillingLimit: 10;
    titleCountingMode: 'DISTINCT_TITLES';
    tvPeopleWeighting: 'ONE_PER_SERIES';
  };
  computedAt: string;
}
