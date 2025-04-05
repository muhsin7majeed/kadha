import { Router, Request, Response } from "express";
import {
  getGenre,
  getTrendingMovies,
  getTrendingTv,
} from "@/controllers/media";

const router = Router();

router.get("/trending-movies", getTrendingMovies);
router.get("/trending-tv", getTrendingTv);
router.get("/genres", getGenre);

export default router;
