import { Router, Request, Response } from "express";
import { getTrendingMovies, getTrendingTv } from "@/controllers/media";

const router = Router();

router.get("/trending-movies", getTrendingMovies);
router.get("/trending-tv", getTrendingTv);

export default router;
