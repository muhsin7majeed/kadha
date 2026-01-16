import { Router } from "express";
import {
  getMe,
  getUserWatchlist,
  getUserLiked,
  getUserWatched,
} from "@/controllers/user";
import { authMiddleware } from "@/middlewares/auth";

const router = Router();

router.get("/me", authMiddleware, getMe);

router.get("/watchlist", authMiddleware, getUserWatchlist);
router.get("/liked", authMiddleware, getUserLiked);
router.get("/watched", authMiddleware, getUserWatched);

export default router;
