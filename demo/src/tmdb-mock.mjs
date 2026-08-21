import { createServer } from 'node:http';

import fixture from '../fixtures/tmdb.mjs';

const visuals = {
  interstellar: ['#07142d', '#d68a45', 'INTERSTELLAR'],
  dune: ['#2b1710', '#dc8b48', 'DUNE'],
  everything: ['#2a1139', '#f25f9c', 'EVERYTHING'],
  arrival: ['#18262b', '#83a7a3', 'ARRIVAL'],
  blade: ['#181326', '#e45536', 'BLADE RUNNER'],
  severance: ['#0b2528', '#54c4b8', 'SEVERANCE'],
  bear: ['#2a1610', '#f0a45b', 'THE BEAR'],
  arcane: ['#101d36', '#51a8d6', 'ARCANE'],
};

const escapeXml = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const posterSvg = (slug, backdrop) => {
  const [start, end, title] = visuals[slug] ?? ['#16161a', '#777780', slug.toUpperCase()];
  const width = backdrop ? 1600 : 800;
  const height = backdrop ? 900 : 1200;
  const titleSize = backdrop ? 102 : 68;
  const titleY = backdrop ? 492 : 650;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <radialGradient id="g" cx="72%" cy="22%" r="92%"><stop stop-color="${end}"/><stop offset=".56" stop-color="${start}"/><stop offset="1" stop-color="#040407"/></radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="42"/></filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#g)"/>
    <circle cx="${width * 0.72}" cy="${height * 0.25}" r="${backdrop ? 220 : 150}" fill="${end}" opacity=".28" filter="url(#blur)"/>
    <path d="M0 ${height * 0.76} C ${width * 0.28} ${height * 0.57}, ${width * 0.62} ${height * 0.98}, ${width} ${height * 0.66} V ${height} H0Z" fill="#050507" opacity=".82"/>
    <text x="50%" y="${titleY}" text-anchor="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="700" letter-spacing="${backdrop ? 14 : 9}">${escapeXml(title)}</text>
    <text x="50%" y="${titleY + 54}" text-anchor="middle" fill="white" opacity=".56" font-family="Arial, Helvetica, sans-serif" font-size="${backdrop ? 22 : 20}" letter-spacing="7">A KADHA DEMO EDITION</text>
  </svg>`;
};

const toListItem = (details, type) => ({
  adult: details.adult,
  backdrop_path: details.backdrop_path,
  genre_ids: details.genres.map((genre) => genre.id),
  id: details.id,
  original_language: details.original_language,
  overview: details.overview,
  popularity: details.popularity,
  poster_path: details.poster_path,
  vote_average: details.vote_average,
  vote_count: details.vote_count,
  ...(type === 'movie'
    ? {
        original_title: details.original_title,
        release_date: details.release_date,
        title: details.title,
        video: false,
      }
    : {
        first_air_date: details.first_air_date,
        name: details.name,
        original_name: details.original_name,
        origin_country: details.origin_country,
      }),
});

const list = (type) => {
  const results = Object.entries(fixture.details)
    .filter(([key]) => key.startsWith(`${type}:`))
    .map(([, details]) => toListItem(details, type));

  return { page: 1, results, total_pages: 1, total_results: results.length };
};

const json = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'application/json' });
  response.end(JSON.stringify(body));
};

createServer((request, response) => {
  const url = new URL(request.url ?? '/', 'http://tmdb');
  const detailMatch = url.pathname.match(/^\/(movie|tv)\/(\d+)$/);
  const seasonMatch = url.pathname.match(/^\/tv\/(\d+)\/season\/(\d+)$/);

  if (url.pathname === '/health') return json(response, 200, { status: 'healthy' });
  if (url.pathname.startsWith('/images/')) {
    const filename = url.pathname.split('/').at(-1) ?? '';
    const backdrop = filename.endsWith('-backdrop.svg');
    const slug = filename.replace('-backdrop.svg', '').replace('.svg', '');
    response.writeHead(200, {
      'content-type': 'image/svg+xml',
      'cache-control': 'public, max-age=3600',
      'access-control-allow-origin': '*',
    });
    return response.end(posterSvg(slug, backdrop));
  }
  if (url.pathname === '/genre/movie/list') return json(response, 200, fixture.genres.movie);
  if (url.pathname === '/genre/tv/list') return json(response, 200, fixture.genres.tv);
  if (/^\/trending\/movie\//.test(url.pathname) || url.pathname === '/movie/popular' || url.pathname === '/movie/top_rated') {
    return json(response, 200, list('movie'));
  }
  if (/^\/trending\/tv\//.test(url.pathname) || url.pathname === '/tv/popular' || url.pathname === '/tv/top_rated') {
    return json(response, 200, list('tv'));
  }
  if (url.pathname === '/search/movie') {
    const query = (url.searchParams.get('query') ?? '').toLowerCase();
    const results = list('movie').results.filter((item) => item.title.toLowerCase().includes(query));
    return json(response, 200, { page: 1, results, total_pages: 1, total_results: results.length });
  }
  if (url.pathname === '/search/tv') {
    const query = (url.searchParams.get('query') ?? '').toLowerCase();
    const results = list('tv').results.filter((item) => item.name.toLowerCase().includes(query));
    return json(response, 200, { page: 1, results, total_pages: 1, total_results: results.length });
  }
  if (/^\/(movie|tv)\/\d+\/watch\/providers$/.test(url.pathname)) {
    return json(response, 200, { id: Number(url.pathname.split('/')[2]), results: {} });
  }
  if (seasonMatch) {
    const season = fixture.seasons[`${seasonMatch[1]}:${seasonMatch[2]}`];
    return season ? json(response, 200, season) : json(response, 404, { status_message: 'Season not found' });
  }
  if (detailMatch) {
    const details = fixture.details[`${detailMatch[1]}:${detailMatch[2]}`];
    return details ? json(response, 200, details) : json(response, 404, { status_message: 'Media not found' });
  }

  return json(response, 404, { status_message: `No demo fixture for ${url.pathname}` });
}).listen(4400, '0.0.0.0', () => {
  console.log('TMDB demo fixture server listening on port 4400');
});
