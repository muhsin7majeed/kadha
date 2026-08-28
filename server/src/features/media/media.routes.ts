import { Router } from 'express';

import {
  getGenre,
  getMediaRecommendations,
  getMediaDetails,
  getWatchProviders,
  getNowPlayingMovies,
  getOnTheAirTvs,
  getPopularMovies,
  getPopularTvs,
  getTopRatedMovies,
  getTopRatedTvs,
  getTrendingMovies,
  getTrendingTvs,
  getUpcomingMovies,
  searchMedia,
} from './media.controller';

const router = Router();

router.get('/trending-movies', getTrendingMovies);
router.get('/trending-tvs', getTrendingTvs);

router.get('/top-rated-movies', getTopRatedMovies);
router.get('/top-rated-tvs', getTopRatedTvs);

router.get('/popular-movies', getPopularMovies);
router.get('/popular-tvs', getPopularTvs);

router.get('/now-playing-movies', getNowPlayingMovies);
router.get('/upcoming-movies', getUpcomingMovies);
router.get('/on-the-air-tvs', getOnTheAirTvs);

router.get('/genres', getGenre);

router.get('/search/:mediaType/:query', searchMedia);

router.get('/:mediaType/:id/recommendations', getMediaRecommendations);
router.get('/:mediaType/:id/watch-providers', getWatchProviders);
router.get('/:mediaType/:id', getMediaDetails);

export default router;
