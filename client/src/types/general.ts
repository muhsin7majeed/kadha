export interface LocationState {
  from?: {
    pathname: string;
  };
}

export type TMDBMediaType = 'movie' | 'tv';
export type MediaAction = 'liked' | 'watched' | 'watchlist';
