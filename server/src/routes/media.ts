import { Router, Request, Response } from "express";
import {
  getGenre,
  getPopularMovies,
  getPopularTvs,
  getTopRatedMovies,
  getTopRatedTvs,
  getTrendingMovies,
  getTrendingTvs,
} from "@/controllers/media";

const router = Router();

router.get("/trending-movies", getTrendingMovies);
router.get("/trending-tvs", getTrendingTvs);

router.get("/top-rated-movies", getTopRatedMovies);
router.get("/top-rated-tvs", getTopRatedTvs);

router.get("/popular-movies", getPopularMovies);
router.get("/popular-tvs", getPopularTvs);

router.get("/genres", getGenre);

export default router;
