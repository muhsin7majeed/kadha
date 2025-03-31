import api from "@/lib/axiosInstance";
import { MovieDBTrendingResponse } from "@/lib/types";
import { Request, Response } from "express";

export const getTrendingMovies = async (req: Request, res: Response) => {
  const response = await api.get<MovieDBTrendingResponse>("/movie/popular");

  res.json({ movies: response.data.results });
};

export const getTrendingTv = async (req: Request, res: Response) => {
  res.json({ tv: [{ id: 1, title: "TV 1" }] });
};
