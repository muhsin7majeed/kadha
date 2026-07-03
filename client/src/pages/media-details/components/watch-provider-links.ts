import type { WatchProvider } from '@/features/media/media.types';

type ProviderSearchTarget = {
  ids?: number[];
  names: string[];
  buildUrl: (encodedTitle: string) => string;
};

const PROVIDER_SEARCH_TARGETS: ProviderSearchTarget[] = [
  {
    ids: [8],
    names: ['netflix'],
    buildUrl: (title) => `https://www.netflix.com/search?q=${title}`,
  },
  {
    ids: [9, 119],
    names: ['prime video', 'amazon'],
    buildUrl: (title) => `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${title}`,
  },
  {
    ids: [2, 350],
    names: ['apple'],
    buildUrl: (title) => `https://tv.apple.com/search?term=${title}`,
  },
  {
    ids: [337],
    names: ['disney'],
    buildUrl: (title) => `https://www.disneyplus.com/search/${title}`,
  },
  {
    ids: [15],
    names: ['hulu'],
    buildUrl: (title) => `https://www.hulu.com/search?q=${title}`,
  },
  {
    ids: [384, 1899],
    names: ['max', 'hbo'],
    buildUrl: (title) => `https://www.max.com/search?q=${title}`,
  },
  {
    ids: [531],
    names: ['paramount'],
    buildUrl: (title) => `https://www.paramountplus.com/search/?q=${title}`,
  },
  {
    ids: [386, 387],
    names: ['peacock'],
    buildUrl: (title) => `https://www.peacocktv.com/search?q=${title}`,
  },
  {
    ids: [73],
    names: ['tubi'],
    buildUrl: (title) => `https://tubitv.com/search/${title}`,
  },
  {
    ids: [192],
    names: ['youtube'],
    buildUrl: (title) => `https://www.youtube.com/results?search_query=${title}`,
  },
  {
    ids: [3],
    names: ['google play'],
    buildUrl: (title) => `https://play.google.com/store/search?q=${title}&c=movies`,
  },
  {
    ids: [68],
    names: ['microsoft'],
    buildUrl: (title) => `https://www.microsoft.com/search/shop/movies?q=${title}`,
  },
  {
    ids: [7, 358],
    names: ['vudu', 'fandango'],
    buildUrl: (title) => `https://athome.fandango.com/content/movies/search?searchString=${title}`,
  },
];

export const getProviderSearchLink = (provider: Pick<WatchProvider, 'id' | 'name'>, title: string) => {
  const normalizedName = provider.name.toLowerCase();
  const encodedTitle = encodeURIComponent(title);
  const target = PROVIDER_SEARCH_TARGETS.find(
    (candidate) =>
      candidate.ids?.includes(provider.id) || candidate.names.some((name) => normalizedName.includes(name)),
  );

  return target?.buildUrl(encodedTitle) ?? null;
};
