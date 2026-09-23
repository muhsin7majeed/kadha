import type { MediaCardModel } from '@/features/media/media-card-model';

export interface MediaCardLabItem extends MediaCardModel {
  genres: string[];
}

export const MEDIA_CARD_LAB_ITEMS: MediaCardLabItem[] = [
  {
    adult: false,
    backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
    genre_ids: [878, 12],
    genres: ['Science fiction', 'Adventure'],
    liked: true,
    media_id: 693134,
    media_type: 'movie',
    overview:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    release_date: '2024-02-27',
    runtime: 166,
    title: 'Dune: Part Two',
    vote_average: 8.1,
    vote_count: 6200,
    watchlist: true,
  },
  {
    adult: false,
    backdrop_path: '/aPQsU3yLDUOhLJYnSqkhKRkQTAw.jpg',
    genre_ids: [18, 10768],
    genres: ['Drama', 'War & politics'],
    media_id: 126308,
    media_type: 'tv',
    overview:
      'In Japan in the year 1600, Lord Yoshii Toranaga fights for his life as his enemies unite against him on the Council of Regents.',
    poster_path: '/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg',
    release_date: '2024-02-27',
    runtime: 58,
    title: 'Shōgun',
    vote_average: 8.5,
    vote_count: 1100,
  },
  {
    adult: false,
    backdrop_path: '/4HodYYKEIsGOdinkGi2Ucz6X9i0.jpg',
    genre_ids: [16, 28, 12],
    genres: ['Animation', 'Action', 'Adventure'],
    media_id: 569094,
    media_type: 'movie',
    overview:
      'Miles Morales is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its existence.',
    poster_path: '/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
    release_date: '2023-05-31',
    runtime: 140,
    title: 'Spider-Man: Across the Spider-Verse',
    vote_average: 8.4,
    vote_count: 6700,
    watched: true,
    watchCount: 2,
    rating: 9,
  },
];
