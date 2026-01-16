import api from "@/lib/axiosInstance";
import { MovieDBGenreResponse } from "@/lib/types";
import { MovieDBResponse } from "@/lib/types";
import { Request, Response } from "express";

export const getTrendingMovies = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBResponse>("/trending/movie/day");

  res.json({ movies: response.data.results });
};

export const getTrendingTvs = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBResponse>("/trending/tv/day");

  res.json({ tv: response.data.results });
};

export const getPopularMovies = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBResponse>("/movie/popular");

  res.json({ movies: response.data.results });
};

export const getPopularTvs = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBResponse>("/tv/popular");

  res.json({ tv: response.data.results });
};

export const getTopRatedMovies = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBResponse>("/movie/top_rated");

  res.json({ movies: response.data.results });
};

export const getTopRatedTvs = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBResponse>("/tv/top_rated");

  res.json({ tv: response.data.results });
};

export const getMediaDetails = async (req: Request, res: Response) => {
  const { mediaType, id } = req.params;

  const response = await api.get<MovieDBResponse>(`/${mediaType}/${id}`);

  res.json({ media: response.data });
};

export const getGenre = async (req: Request, res: Response) => {
  const movieGenre = await api.get<MovieDBGenreResponse>("/genre/movie/list");
  const tvGenre = await api.get<MovieDBGenreResponse>("/genre/tv/list");

  let genreHashMap: Record<number, string> = {};

  movieGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    genreHashMap[genre.id] = genre.name;
  });

  tvGenre.data.genres.forEach((genre: { id: number; name: string }) => {
    genreHashMap[genre.id] = genre.name;
  });

  res.json({ genres: genreHashMap });
};

export const searchMedia = async (req: Request, res: Response) => {
  const { query } = req.params;

  const response = await api.get<MovieDBResponse>(
    `/search/multi?query=${query}&include_adult=true`
  );

  const justMoviesAndTvs = response.data.results.filter(
    (result) => result.media_type === "movie" || result.media_type === "tv"
  );

  res.json({ media: justMoviesAndTvs });
};
