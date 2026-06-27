import { Router } from 'express';

import {
  getGenre,
  getMediaDetails,
  getPopularMovies,
  getPopularTvs,
  getTopRatedMovies,
  getTopRatedTvs,
  getTrendingMovies,
  getTrendingTvs,
  searchMedia,
} from './media.controller';

const router = Router();

router.get('/trending-movies', getTrendingMovies);
router.get('/trending-tvs', getTrendingTvs);

router.get('/top-rated-movies', getTopRatedMovies);
router.get('/top-rated-tvs', getTopRatedTvs);

router.get('/popular-movies', getPopularMovies);
router.get('/popular-tvs', getPopularTvs);

router.get('/genres', getGenre);

router.get('/search/:query', searchMedia);

router.get('/:mediaType/:id', getMediaDetails);

export default router;
