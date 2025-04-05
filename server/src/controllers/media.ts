import api from "@/lib/axiosInstance";
import { MovieDBGenreResponse } from "@/lib/types";
import { MovieDBTrendingResponse } from "@/lib/types";
import { Request, Response } from "express";

export const getTrendingMovies = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBTrendingResponse>("/movie/popular");

  res.json({ movies: response.data.results });
};

export const getTrendingTv = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBTrendingResponse>("/tv/popular");

  res.json({ tv: response.data.results });
};

export const getGenre = async (req: Request, res: Response) => {
  const movieGenre = await api.get<MovieDBGenreResponse>("/genre/movie/list");
  const tvGenre = await api.get<MovieDBGenreResponse>("/genre/tv/list");

  let genreHashMap: Record<number, string> = {};

  movieGenre.data.genres.forEach((genre) => {
    genreHashMap[genre.id] = genre.name;
  });

  tvGenre.data.genres.forEach((genre) => {
    genreHashMap[genre.id] = genre.name;
  });

  res.json({ genres: genreHashMap });
};
