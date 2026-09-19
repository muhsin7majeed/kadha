import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';

import {
  OwnerMediaQuery,
  OwnerMediaRatingFilter,
  OwnerMediaSort,
  OwnerMediaSortOrder,
  OwnerMediaTypeFilter,
} from '@/features/user-media/user-media.types';

export const defaultOwnerMediaQuery: OwnerMediaQuery = {
  page: 1,
  query: '',
  mediaType: 'all',
  genres: [],
  rating: 'any',
  sort: 'added',
  order: 'desc',
};

const mediaTypes = new Set<OwnerMediaTypeFilter>(['all', 'movie', 'tv']);
const sorts = new Set<OwnerMediaSort>(['added', 'title', 'releaseDate', 'runtime', 'tmdbScore', 'rating']);
const orders = new Set<OwnerMediaSortOrder>(['asc', 'desc']);

const parseInteger = (value: string | null, min: number, max: number) => {
  if (value === null || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return parsed >= min && parsed <= max ? parsed : undefined;
};

const parseGenres = (value: string | null) => {
  if (!value || value.length > 500) return [];
  const parts = value.split(',');
  const parsed = parts.map((part) => parseInteger(part, 1, Number.MAX_SAFE_INTEGER));
  if (parsed.some((genreId) => genreId === undefined)) return [];
  return [...new Set(parsed as number[])].sort((first, second) => first - second);
};

const parseRating = (value: string | null): OwnerMediaRatingFilter => {
  if (value === 'rated' || value === 'unrated') return value;
  return parseInteger(value, 1, 10) ?? 'any';
};

export const parseOwnerMediaSearchParams = (params: URLSearchParams): OwnerMediaQuery => {
  const queryValue = params.get('query')?.trim() ?? '';
  const mediaTypeValue = params.get('mediaType') as OwnerMediaTypeFilter | null;
  const sortValue = params.get('sort') as OwnerMediaSort | null;
  const orderValue = params.get('order') as OwnerMediaSortOrder | null;
  let yearFrom = parseInteger(params.get('yearFrom'), 1874, 9999);
  let yearTo = parseInteger(params.get('yearTo'), 1874, 9999);

  if (yearFrom !== undefined && yearTo !== undefined && yearFrom > yearTo) {
    yearFrom = undefined;
    yearTo = undefined;
  }

  const mediaType = mediaTypeValue && mediaTypes.has(mediaTypeValue) ? mediaTypeValue : 'all';
  let sort = sortValue && sorts.has(sortValue) ? sortValue : 'added';
  let order = orderValue && orders.has(orderValue) ? orderValue : 'desc';

  if (sort === 'runtime' && mediaType === 'all') {
    sort = 'added';
    order = 'desc';
  }

  return {
    page: parseInteger(params.get('page'), 1, Number.MAX_SAFE_INTEGER) ?? 1,
    query: queryValue.length <= 120 ? queryValue : '',
    mediaType,
    genres: parseGenres(params.get('genres')),
    ...(yearFrom !== undefined ? { yearFrom } : {}),
    ...(yearTo !== undefined ? { yearTo } : {}),
    rating: parseRating(params.get('rating')),
    sort,
    order,
  };
};

export const serializeOwnerMediaQuery = (query: OwnerMediaQuery) => {
  const params = new URLSearchParams();
  const normalizedQuery = query.query.trim();
  const genres = [...new Set(query.genres)].sort((first, second) => first - second);

  if (query.page > 1) params.set('page', String(query.page));
  if (normalizedQuery) params.set('query', normalizedQuery);
  if (query.mediaType !== 'all') params.set('mediaType', query.mediaType);
  if (genres.length > 0) params.set('genres', genres.join(','));
  if (query.yearFrom !== undefined) params.set('yearFrom', String(query.yearFrom));
  if (query.yearTo !== undefined) params.set('yearTo', String(query.yearTo));
  if (query.rating !== 'any') params.set('rating', String(query.rating));
  if (query.sort !== 'added') params.set('sort', query.sort);
  if (query.order !== 'desc') params.set('order', query.order);

  return params;
};

export const updateOwnerMediaQuery = (current: OwnerMediaQuery, patch: Partial<OwnerMediaQuery>): OwnerMediaQuery => {
  const changesCriteria = Object.keys(patch).some((key) => key !== 'page');
  const next = {
    ...current,
    ...patch,
    ...(changesCriteria ? { page: 1 } : {}),
  };

  if (next.sort === 'runtime' && next.mediaType === 'all') {
    next.sort = 'added';
    next.order = 'desc';
  }

  return next;
};

interface UpdateQueryOptions {
  replace?: boolean;
}

const useOwnerMediaQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = useMemo(() => parseOwnerMediaSearchParams(searchParams), [searchParams]);
  const canonicalSearch = useMemo(() => serializeOwnerMediaQuery(query).toString(), [query]);
  const searchParamsRef = useRef(searchParams);
  const setSearchParamsRef = useRef(setSearchParams);
  searchParamsRef.current = searchParams;
  setSearchParamsRef.current = setSearchParams;

  useEffect(() => {
    if (searchParams.toString() !== canonicalSearch) {
      setSearchParams(canonicalSearch, { replace: true });
    }
  }, [canonicalSearch, searchParams, setSearchParams]);

  const updateQuery = useCallback(
    (patch: Partial<OwnerMediaQuery>, options: UpdateQueryOptions = {}) => {
      setSearchParamsRef.current(
        serializeOwnerMediaQuery(updateOwnerMediaQuery(parseOwnerMediaSearchParams(searchParamsRef.current), patch)),
        { replace: options.replace },
      );
    },
    [],
  );

  return { query, updateQuery };
};

export const toOwnerMediaRequestParams = (query: OwnerMediaQuery) => ({
  page: query.page,
  query: query.query || undefined,
  mediaType: query.mediaType === 'all' ? undefined : query.mediaType,
  genres: query.genres.length > 0 ? query.genres.join(',') : undefined,
  yearFrom: query.yearFrom,
  yearTo: query.yearTo,
  rating: query.rating === 'any' ? undefined : query.rating,
  sort: query.sort,
  order: query.order,
});

export default useOwnerMediaQuery;
