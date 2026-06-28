import api from '@/lib/axiosInstance';

import {
  MovieDBGenreResponse,
  MovieDBMovieResponse,
  MovieDBTvResponse,
  TMDBMovieDetails,
  TMDBTvDetails,
} from './media.types';

export async function fetchTrendingMovies() {
  return api.get<MovieDBMovieResponse>('/trending/movie/day');
}

export async function fetchTrendingTvs() {
  return api.get<MovieDBTvResponse>('/trending/tv/day');
}

export async function fetchPopularMovies() {
  return api.get<MovieDBMovieResponse>('/movie/popular');
}

export async function fetchPopularTvs() {
  return api.get<MovieDBTvResponse>('/tv/popular');
}

export async function fetchTopRatedMovies() {
  return api.get<MovieDBMovieResponse>('/movie/top_rated');
}

export async function fetchTopRatedTvs() {
  return api.get<MovieDBTvResponse>('/tv/top_rated');
}

export async function fetchMediaDetails(mediaType: string, id: string) {
  return api.get<TMDBMovieDetails | TMDBTvDetails>(`/${mediaType}/${id}`);
}

export async function fetchMovieGenres() {
  return api.get<MovieDBGenreResponse>('/genre/movie/list');
}

export async function fetchTvGenres() {
  return api.get<MovieDBGenreResponse>('/genre/tv/list');
}

export async function searchMediaByQuery(query: string, page: number) {
  return api.get<MovieDBMovieResponse | MovieDBTvResponse>('/search/multi', {
    params: {
      query,
      page,
      include_adult: true,
    },
  });
}
